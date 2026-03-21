"use client";

import { useMutation } from "./MutationContext";

export default function FloatingTrigger() {
  const { triggerMutation, isMutating, corruption } = useMutation();

  const baseClasses =
    "fixed bottom-6 right-6 z-[10000] rounded-full shadow-lg transition-all duration-500 cursor-pointer disabled:opacity-50 text-sm font-medium";

  if (corruption >= 70) {
    return (
      <button
        onClick={() => triggerMutation()}
        disabled={isMutating}
        className={`${baseClasses} px-5 py-3 glitch-text`}
        style={{
          background: `hsl(${corruption * 3}, 70%, 50%)`,
          color: "#000",
          border: `2px solid hsl(${corruption * 3 + 180}, 60%, 60%)`,
          boxShadow: `0 0 ${corruption - 50}px hsla(${corruption * 3}, 70%, 50%, 0.5)`,
        }}
      >
        {isMutating ? "..." : `QWUNK [${Math.round(corruption)}%]`}
      </button>
    );
  }

  if (corruption >= 30) {
    return (
      <button
        onClick={() => triggerMutation()}
        disabled={isMutating}
        className={`${baseClasses} px-4 py-2.5 bg-zinc-800 text-zinc-200 border border-zinc-600 hover:bg-zinc-700`}
      >
        {isMutating ? "..." : "Feedback"}
      </button>
    );
  }

  return (
    <button
      onClick={() => triggerMutation()}
      disabled={isMutating}
      className={`${baseClasses} px-4 py-2.5 bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900`}
    >
      {isMutating ? "..." : "Feedback ↗"}
    </button>
  );
}
