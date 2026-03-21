"use client";

import { useEffect, useRef, useId } from "react";
import { useMutation } from "./MutationContext";

interface MutationZoneProps {
  children: React.ReactNode;
  /** Optional human-readable name for this zone (shown in debug/stats) */
  name?: string;
}

/**
 * Wrap any React children in a MutationZone.
 *
 * On first render the children display normally. When mutateRandom() or
 * mutateZone(id) is called, this zone:
 *   1. Reads its own container's innerHTML (the real rendered DOM)
 *   2. Sends it to the LLM: "here is a piece of UI — qwunk it"
 *   3. Replaces the container contents with whatever the LLM returns
 *
 * After the first mutation React no longer controls the subtree — the
 * qwunk has taken over. Subsequent mutations feed the already-mutated
 * HTML back to the LLM, so chaos compounds.
 */
export default function MutationZone({ children, name }: MutationZoneProps) {
  const reactId = useId();
  const id = name || reactId;
  const containerRef = useRef<HTMLDivElement>(null);
  const isMutatedRef = useRef(false);
  const childrenRef = useRef<HTMLDivElement>(null);
  const { register, unregister } = useMutation();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const zone = {
      id,
      mutations: 0,

      capture: () => {
        return container.innerHTML;
      },

      inject: (html: string) => {
        // Once we inject, React's children are gone — the qwunk owns this div
        isMutatedRef.current = true;

        // Inject the HTML
        container.innerHTML = html;

        // Execute any <script> tags (innerHTML doesn't run them)
        const scripts = container.querySelectorAll("script");
        scripts.forEach((oldScript) => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr) =>
            newScript.setAttribute(attr.name, attr.value)
          );
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });
      },
    };

    register(zone);
    return () => unregister(id);
  }, [id, register, unregister]);

  return (
    <div
      ref={containerRef}
      data-mutation-zone={id}
      className="mutation-zone relative"
    >
      {/*
        React renders children here normally. After the first mutation,
        inject() overwrites innerHTML and React's virtual DOM diverges
        from reality — which is exactly the point.
      */}
      <div ref={childrenRef}>{children}</div>
    </div>
  );
}
