"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QwunkLore = Record<string, any>;

interface RegisteredZone {
  id: string;
  capture: () => string;
  inject: (html: string) => void;
  mutations: number;
  autoInterval: number | null;
  tags: string[];
}

interface MutationContextValue {
  register: (zone: RegisteredZone) => void;
  unregister: (id: string) => void;
  mutateRandom: () => Promise<void>;
  mutateZone: (id: string) => Promise<void>;
  mutateAll: () => Promise<void>;
  mutateTagged: (tag: string) => Promise<void>;
  isMutating: boolean;
  totalMutations: number;
  zoneMutations: Record<string, number>;
  startPassiveQwunk: () => void;
  stopPassiveQwunk: () => void;
  passiveActive: boolean;
  lore: QwunkLore | null;
}

const MutationCtx = createContext<MutationContextValue | null>(null);

export function useMutation() {
  const ctx = useContext(MutationCtx);
  if (!ctx) throw new Error("useMutation must be used inside MutationProvider");
  return ctx;
}

export function MutationProvider({ children }: { children: React.ReactNode }) {
  const zonesRef = useRef<Map<string, RegisteredZone>>(new Map());
  const [isMutating, setIsMutating] = useState(false);
  const [totalMutations, setTotalMutations] = useState(0);
  const [zoneMutations, setZoneMutations] = useState<Record<string, number>>(
    {}
  );
  const [passiveActive, setPassiveActive] = useState(false);
  const passiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map()
  );
  const inflightRef = useRef<Set<string>>(new Set());

  // ── Lore state ──
  const [lore, setLore] = useState<QwunkLore | null>(null);
  const loreRef = useRef<QwunkLore | null>(null);
  const loreInflightRef = useRef(false);
  const loreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref in sync so callbacks always have latest lore
  useEffect(() => {
    loreRef.current = lore;
  }, [lore]);

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
      if (data.lore) {
        setLore(data.lore);
      }
    } catch (err) {
      console.error("Lore evolution failed:", err);
    } finally {
      loreInflightRef.current = false;
    }
  }, []);

  // ── Lore evolution loop: evolve every 45-75s once passive is active ──
  const startLoreEngine = useCallback(() => {
    if (loreTimerRef.current) return;

    // Initialize lore immediately
    evolveLore();

    const scheduleNext = () => {
      const delay = 45000 + Math.random() * 30000;
      loreTimerRef.current = setTimeout(() => {
        evolveLore();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }, [evolveLore]);

  // ── Zone mutations (now include lore) ──
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
        }),
      });

      const data = await res.json();
      if (data.html) {
        zone.inject(data.html);
        zone.mutations++;
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

  const register = useCallback((zone: RegisteredZone) => {
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

  const mutateZone = useCallback(
    async (id: string) => {
      const zone = zonesRef.current.get(id);
      if (!zone) return;
      setIsMutating(true);
      try {
        await doMutate(zone);
      } finally {
        setIsMutating(false);
      }
    },
    [doMutate]
  );

  const mutateRandom = useCallback(async () => {
    const zones = Array.from(zonesRef.current.values());
    if (zones.length === 0) return;
    const zone = zones[Math.floor(Math.random() * zones.length)];
    setIsMutating(true);
    try {
      await doMutate(zone);
    } finally {
      setIsMutating(false);
    }
  }, [doMutate]);

  const mutateAll = useCallback(async () => {
    const zones = Array.from(zonesRef.current.values());
    if (zones.length === 0) return;
    setIsMutating(true);
    try {
      await Promise.all(zones.map((z) => doMutate(z)));
    } finally {
      setIsMutating(false);
    }
  }, [doMutate]);

  const mutateTagged = useCallback(
    async (tag: string) => {
      const zones = Array.from(zonesRef.current.values()).filter((z) =>
        z.tags.includes(tag)
      );
      if (zones.length === 0) return;
      const zone = zones[Math.floor(Math.random() * zones.length)];
      await doMutate(zone);
    },
    [doMutate]
  );

  // ── Passive background mutation engine ──
  const startPassiveQwunk = useCallback(() => {
    if (passiveTimerRef.current) return;
    setPassiveActive(true);

    // Also start the lore engine
    startLoreEngine();

    const tick = () => {
      const zones = Array.from(zonesRef.current.values());
      if (zones.length === 0) return;
      const zone = zones[Math.floor(Math.random() * zones.length)];
      doMutate(zone);
    };

    tick();
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 20000;
      passiveTimerRef.current = setTimeout(() => {
        tick();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }, [doMutate, startLoreEngine]);

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

  // ── Per-zone auto-mutation timers ──
  useEffect(() => {
    const checkAutoZones = setInterval(() => {
      for (const [id, zone] of zonesRef.current) {
        if (zone.autoInterval && !autoTimersRef.current.has(id)) {
          const jitter = Math.random() * 5000;
          const timer = setInterval(() => {
            doMutate(zone);
          }, zone.autoInterval + jitter);
          autoTimersRef.current.set(id, timer);
        }
      }
    }, 2000);

    return () => {
      clearInterval(checkAutoZones);
      for (const timer of autoTimersRef.current.values()) {
        clearInterval(timer);
      }
    };
  }, [doMutate]);

  return (
    <MutationCtx.Provider
      value={{
        register,
        unregister,
        mutateRandom,
        mutateZone,
        mutateAll,
        mutateTagged,
        isMutating,
        totalMutations,
        zoneMutations,
        startPassiveQwunk,
        stopPassiveQwunk,
        passiveActive,
        lore,
      }}
    >
      {children}
    </MutationCtx.Provider>
  );
}
