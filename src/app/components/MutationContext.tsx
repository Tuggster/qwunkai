"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QwunkLore = Record<string, any>;

export type Phase = "clean" | "corrupting" | "qwunk";

interface RegisteredZone {
  id: string;
  capture: () => string;
  inject: (html: string) => void;
  mutations: number;
  autoInterval: number | null;
  tags: string[];
  /** Custom directive for this zone's LLM prompt */
  directive?: string;
}

interface MutationContextValue {
  register: (zone: RegisteredZone) => void;
  unregister: (id: string) => void;
  triggerMutation: () => Promise<void>;
  mutateRandom: () => Promise<void>;
  mutateZone: (id: string) => Promise<void>;
  mutateAll: () => Promise<void>;
  isMutating: boolean;
  totalMutations: number;
  zoneMutations: Record<string, number>;
  startPassiveQwunk: () => void;
  stopPassiveQwunk: () => void;
  passiveActive: boolean;
  lore: QwunkLore | null;
  phase: Phase;
  getCachedHtml: (id: string) => string | null;
  setCachedHtml: (id: string, html: string) => void;
  /** Corruption level 0-100. Drives whole-page visual degradation. */
  corruption: number;
  /** Boost corruption (called on user interaction) */
  addCorruption: (amount: number) => void;
}

const MutationCtx = createContext<MutationContextValue | null>(null);

export function useMutation() {
  const ctx = useContext(MutationCtx);
  if (!ctx) throw new Error("useMutation must be used inside MutationProvider");
  return ctx;
}

function computePhase(corruption: number): Phase {
  if (corruption < 15) return "clean";
  if (corruption < 60) return "corrupting";
  return "qwunk";
}

export function MutationProvider({ children }: { children: React.ReactNode }) {
  const zonesRef = useRef<Map<string, RegisteredZone>>(new Map());
  const [isMutating, setIsMutating] = useState(false);
  const [totalMutations, setTotalMutations] = useState(0);
  const [zoneMutations, setZoneMutations] = useState<Record<string, number>>({});
  const [passiveActive, setPassiveActive] = useState(false);
  const passiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const inflightRef = useRef<Set<string>>(new Set());

  // ── Corruption: 0→100 over ~45s, drives whole-page visual degradation ──
  const [corruption, setCorruption] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = localStorage.getItem("qwunk-corruption");
      if (!raw) return 0;
      const { value, timestamp } = JSON.parse(raw) as { value: number; timestamp: number };
      const elapsed = (Date.now() - timestamp) / 1000; // seconds
      const offlineBonus = Math.min(30, Math.floor(elapsed / 30));
      return Math.min(100, (value || 0) + offlineBonus);
    } catch {
      return 0;
    }
  });
  const corruptionRef = useRef(corruption);
  useEffect(() => { corruptionRef.current = corruption; }, [corruption]);

  // Debounce-save corruption + timestamp to localStorage
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          "qwunk-corruption",
          JSON.stringify({ value: corruption, timestamp: Date.now() })
        );
      } catch { /* storage full or unavailable */ }
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [corruption]);

  const addCorruption = useCallback((amount: number) => {
    setCorruption((c) => Math.min(100, c + amount));
  }, []);

  // Auto-increment corruption (accelerating)
  useEffect(() => {
    // 5s clean period, then start corrupting
    const startDelay = setTimeout(() => {
      const tick = () => {
        const c = corruptionRef.current;
        if (c >= 100) return;

        // Accelerating: slow at start, fast at end
        let increment: number;
        let delay: number;
        if (c < 30) {
          increment = 1;
          delay = 550; // ~18s for 0-30
        } else if (c < 60) {
          increment = 1;
          delay = 380; // ~11s for 30-60
        } else {
          increment = 1;
          delay = 220; // ~9s for 60-100
        }

        setCorruption((prev) => Math.min(100, prev + increment));
        setTimeout(tick, delay);
      };
      tick();
    }, 5000);

    return () => clearTimeout(startDelay);
  }, []);

  // Mutation cache — persists across page navigations within a session.
  // Bump CACHE_VERSION to nuke stale caches on deploy.
  const CACHE_VERSION = "qwunk-v5";
  const mutationCacheRef = useRef<Map<string, string>>(new Map());
  const zoneMutationCountsRef = useRef<Map<string, number>>(new Map());

  // On mount: clear corruption + caches if version changed
  useEffect(() => {
    const storedVersion = localStorage.getItem("qwunk-cache-version");
    if (storedVersion !== CACHE_VERSION) {
      localStorage.setItem("qwunk-cache-version", CACHE_VERSION);
      localStorage.removeItem("qwunk-corruption");
      mutationCacheRef.current.clear();
      zoneMutationCountsRef.current.clear();
      setCorruption(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lore
  const [lore, setLore] = useState<QwunkLore | null>(null);
  const loreRef = useRef<QwunkLore | null>(null);
  const loreInflightRef = useRef(false);
  const loreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phase = useMemo(() => computePhase(corruption), [corruption]);
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { loreRef.current = lore; }, [lore]);

  // Cache accessors
  const getCachedHtml = useCallback((id: string) => {
    return mutationCacheRef.current.get(id) || null;
  }, []);

  const setCachedHtml = useCallback((id: string, html: string) => {
    mutationCacheRef.current.set(id, html);
  }, []);

  // Lore
  const evolveLore = useCallback(async () => {
    if (loreInflightRef.current) return;
    loreInflightRef.current = true;
    try {
      const res = await fetch("/api/lore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lore: loreRef.current }),
      });
      const data = await res.json();
      if (data.lore) setLore(data.lore);
    } catch (err) {
      console.error("Lore evolution failed:", err);
    } finally {
      loreInflightRef.current = false;
    }
  }, []);

  const startLoreEngine = useCallback(() => {
    if (loreTimerRef.current) return;
    evolveLore();
    const scheduleNext = () => {
      const delay = 20000 + Math.random() * 15000; // lore evolves every 20-35s
      loreTimerRef.current = setTimeout(() => {
        evolveLore();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }, [evolveLore]);

  // Core mutation
  const doMutate = useCallback(async (zone: RegisteredZone) => {
    if (inflightRef.current.has(zone.id)) return;
    inflightRef.current.add(zone.id);
    try {
      const currentHtml = zone.capture();
      const res = await fetch("/api/mutate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId: zone.id,
          currentHtml,
          mutationCount: zone.mutations,
          lore: loreRef.current,
          phase: phaseRef.current,
          directive: zone.directive || null,
        }),
      });
      const data = await res.json();
      if (data.html) {
        zone.inject(data.html);
        zone.mutations++;
        zoneMutationCountsRef.current.set(zone.id, zone.mutations);
        setTotalMutations((t) => t + 1);
        setZoneMutations((prev) => ({
          ...prev,
          [zone.id]: (prev[zone.id] || 0) + 1,
        }));
      }
    } finally {
      inflightRef.current.delete(zone.id);
    }
  }, []);

  // Pick zone based on phase
  const pickZone = useCallback((): RegisteredZone | null => {
    const c = corruptionRef.current;

    // In qwunk phase (c>=60): always root
    if (phaseRef.current === "qwunk") {
      const root = zonesRef.current.get("__root__");
      if (root) return root;
    }

    // From corruption 35+: increasing chance to hit root
    // At 35: 20% root chance. At 55: 60% root chance.
    if (c >= 35) {
      const rootChance = 0.2 + ((c - 35) / 25) * 0.4;
      if (Math.random() < rootChance) {
        const root = zonesRef.current.get("__root__");
        if (root) return root;
      }
    }

    const zones = Array.from(zonesRef.current.values()).filter(
      (z) => z.id !== "__root__"
    );
    if (zones.length === 0) return null;
    return zones[Math.floor(Math.random() * zones.length)];
  }, []);

  const register = useCallback((zone: RegisteredZone) => {
    // Restore mutation count from cache
    const cachedCount = zoneMutationCountsRef.current.get(zone.id);
    if (cachedCount) zone.mutations = cachedCount;
    zonesRef.current.set(zone.id, zone);
  }, []);

  const unregister = useCallback((id: string) => {
    zonesRef.current.delete(id);
    const timer = autoTimersRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      autoTimersRef.current.delete(id);
    }
  }, []);

  const mutateZone = useCallback(async (id: string) => {
    const zone = zonesRef.current.get(id);
    if (!zone) return;
    setIsMutating(true);
    try { await doMutate(zone); } finally { setIsMutating(false); }
  }, [doMutate]);

  const mutateRandom = useCallback(async () => {
    const zone = pickZone();
    if (!zone) return;
    setIsMutating(true);
    try { await doMutate(zone); } finally { setIsMutating(false); }
  }, [doMutate, pickZone]);

  const mutateAll = useCallback(async () => {
    if (phaseRef.current === "qwunk") {
      const root = zonesRef.current.get("__root__");
      if (root) {
        setIsMutating(true);
        try { await doMutate(root); } finally { setIsMutating(false); }
      }
      return;
    }
    const zones = Array.from(zonesRef.current.values()).filter(z => z.id !== "__root__");
    if (zones.length === 0) return;
    setIsMutating(true);
    try { await Promise.all(zones.map(z => doMutate(z))); } finally { setIsMutating(false); }
  }, [doMutate]);

  // Main public API
  const startPassiveQwunkFn = useCallback(() => {
    if (passiveTimerRef.current) return;
    setPassiveActive(true);
    startLoreEngine();
    const tick = () => {
      const zone = pickZone();
      if (zone) doMutate(zone);
    };
    tick();
    const scheduleNext = () => {
      // Accelerate as corruption rises: 8s at start → 3s at high corruption
      const c = corruptionRef.current;
      const baseDelay = c > 60 ? 3000 : c > 35 ? 5000 : 8000;
      const jitter = Math.random() * 4000;
      const delay = baseDelay + jitter;
      passiveTimerRef.current = setTimeout(() => {
        tick();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }, [doMutate, pickZone, startLoreEngine]);

  const triggerMutation = useCallback(async () => {
    // Boost corruption on every user interaction
    addCorruption(5 + Math.random() * 5);
    if (!passiveTimerRef.current) {
      startPassiveQwunkFn();
    }
    await mutateRandom();
  }, [mutateRandom, startPassiveQwunkFn, addCorruption]);

  const startPassiveQwunk = useCallback(() => startPassiveQwunkFn(), [startPassiveQwunkFn]);

  const stopPassiveQwunk = useCallback(() => {
    if (passiveTimerRef.current) {
      clearTimeout(passiveTimerRef.current);
      passiveTimerRef.current = null;
    }
    if (loreTimerRef.current) {
      clearTimeout(loreTimerRef.current);
      loreTimerRef.current = null;
    }
    setPassiveActive(false);
  }, []);

  // Per-zone auto timers
  // In qwunk phase: skip page-content zones but keep overlay/ambient zones alive
  useEffect(() => {
    const checkAutoZones = setInterval(() => {
      for (const [id, zone] of zonesRef.current) {
        if (id === "__root__") continue;
        if (zone.autoInterval && !autoTimersRef.current.has(id)) {
          const jitter = Math.random() * 5000;
          const timer = setInterval(() => {
            // In qwunk phase, only fire for overlay/ambient zones (they live outside root)
            const isOverlay = zone.tags.includes("overlay") || zone.tags.includes("ambient") || zone.tags.includes("passive");
            if (phaseRef.current === "qwunk" && !isOverlay) return;
            doMutate(zone);
          }, zone.autoInterval + jitter);
          autoTimersRef.current.set(id, timer);
        }
      }
    }, 2000);
    return () => {
      clearInterval(checkAutoZones);
      for (const timer of autoTimersRef.current.values()) clearInterval(timer);
    };
  }, [doMutate]);

  return (
    <MutationCtx.Provider
      value={{
        register,
        unregister,
        triggerMutation,
        mutateRandom,
        mutateZone,
        mutateAll,
        isMutating,
        totalMutations,
        zoneMutations,
        startPassiveQwunk,
        stopPassiveQwunk,
        passiveActive,
        lore,
        phase,
        getCachedHtml,
        setCachedHtml,
        corruption,
        addCorruption,
      }}
    >
      {children}
    </MutationCtx.Provider>
  );
}
