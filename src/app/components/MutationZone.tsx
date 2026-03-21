"use client";

import { useEffect, useRef, useId } from "react";
import { useMutation } from "./MutationContext";

interface MutationZoneProps {
  children: React.ReactNode;
  /** Human-readable name for this zone */
  name?: string;
  /** If set, this zone will auto-mutate on this interval (ms) */
  autoMutateMs?: number;
  /** Tags for grouping/filtering (e.g. "passive", "background") */
  tags?: string[];
}

export default function MutationZone({
  children,
  name,
  autoMutateMs,
  tags = [],
}: MutationZoneProps) {
  const reactId = useId();
  const id = name || reactId;
  const containerRef = useRef<HTMLDivElement>(null);
  const { register, unregister } = useMutation();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const zone = {
      id,
      mutations: 0,
      autoInterval: autoMutateMs || null,
      tags,

      capture: () => {
        return container.innerHTML;
      },

      inject: (html: string) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div
      ref={containerRef}
      data-mutation-zone={id}
      className="mutation-zone relative"
    >
      <div>{children}</div>
    </div>
  );
}
