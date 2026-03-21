"use client";

import { useEffect, useRef, useId, useState, useCallback } from "react";
import { useMutation } from "./MutationContext";

interface MutationZoneProps {
  children: React.ReactNode;
  name?: string;
  autoMutateMs?: number;
  tags?: string[];
  isRoot?: boolean;
  /** Custom directive passed to the LLM for this zone's mutations */
  directive?: string;
}

/**
 * MutationZone — wraps React children and allows LLM mutations to replace them.
 *
 * Key behaviors:
 * - On first render: shows children normally
 * - After mutation: switches to dangerouslySetInnerHTML (React stops controlling subtree)
 * - On re-mount (navigation): checks cache and re-injects if previously mutated
 * - Scripts in mutated HTML are executed manually
 * - In qwunk phase with isRoot: navigation has no visible effect — the qwunk persists
 */
export default function MutationZone({
  children,
  name,
  autoMutateMs,
  tags = [],
  isRoot = false,
  directive,
}: MutationZoneProps) {
  const reactId = useId();
  const id = isRoot ? "__root__" : name || reactId;
  const containerRef = useRef<HTMLDivElement>(null);
  const { register, unregister, getCachedHtml, setCachedHtml } = useMutation();

  // Initialize from cache — if this zone was mutated before, restore immediately
  const [mutatedHtml, setMutatedHtml] = useState<string | null>(() => getCachedHtml(id));

  // Execute scripts whenever mutatedHtml changes
  useEffect(() => {
    if (mutatedHtml === null || !containerRef.current) return;

    // Small delay to ensure DOM is updated
    const timer = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const scripts = container.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    });

    return () => cancelAnimationFrame(timer);
  }, [mutatedHtml]);

  // The inject function — called by the context when this zone is mutated
  const injectFn = useCallback(
    (html: string) => {
      setMutatedHtml(html);
      setCachedHtml(id, html);
    },
    [id, setCachedHtml]
  );

  // Register with context
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const zone = {
      id,
      mutations: 0,
      autoInterval: isRoot ? null : autoMutateMs || null,
      tags,
      directive,

      capture: () => container.innerHTML,
      inject: injectFn,
    };

    register(zone);
    return () => unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, injectFn]);

  return (
    <div ref={containerRef} data-mutation-zone={id} className="mutation-zone relative">
      {mutatedHtml !== null ? (
        // React is hands-off — the LLM's HTML is rendered opaquely
        <div dangerouslySetInnerHTML={{ __html: mutatedHtml }} />
      ) : (
        // Normal React rendering
        children
      )}
    </div>
  );
}
