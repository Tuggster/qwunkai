"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface RegisteredZone {
  id: string;
  /** Read the current DOM inside this zone */
  capture: () => string;
  /** Replace the zone's visible content with new HTML */
  inject: (html: string) => void;
  /** How many times this zone has been mutated */
  mutations: number;
}

interface MutationContextValue {
  /** Register a zone — called by MutationZone on mount */
  register: (zone: RegisteredZone) => void;
  /** Unregister a zone — called on unmount */
  unregister: (id: string) => void;
  /** Mutate a random registered zone */
  mutateRandom: () => Promise<void>;
  /** Mutate a specific zone by id */
  mutateZone: (id: string) => Promise<void>;
  /** Mutate every registered zone in parallel */
  mutateAll: () => Promise<void>;
  /** True while any mutation request is in-flight */
  isMutating: boolean;
  /** Total mutations applied across all zones */
  totalMutations: number;
  /** Map of zone id -> mutation count */
  zoneMutations: Record<string, number>;
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

  const register = useCallback((zone: RegisteredZone) => {
    zonesRef.current.set(zone.id, zone);
  }, []);

  const unregister = useCallback((id: string) => {
    zonesRef.current.delete(id);
  }, []);

  const doMutate = useCallback(async (zone: RegisteredZone) => {
    const currentHtml = zone.capture();

    const res = await fetch("/api/mutate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zoneId: zone.id,
        currentHtml,
        mutationCount: zone.mutations,
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

  return (
    <MutationCtx.Provider
      value={{
        register,
        unregister,
        mutateRandom,
        mutateZone,
        mutateAll,
        isMutating,
        totalMutations,
        zoneMutations,
      }}
    >
      {children}
    </MutationCtx.Provider>
  );
}
