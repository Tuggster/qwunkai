"use client";

import { useCallback, useRef, useState } from "react";
import { useMutation } from "./MutationContext";

function getPlaceholder(corruption: number): string {
  if (corruption < 35) return "Search...";
  if (corruption < 55) return "Type something...";
  if (corruption < 75) return "Feed the qwunk...";
  return "It's listening...";
}

function getGlitchClass(corruption: number): string {
  if (corruption < 40) return "";
  if (corruption < 60) return "qwunk-input-glitch-1";
  if (corruption < 80) return "qwunk-input-glitch-2";
  return "qwunk-input-glitch-3";
}

export default function UserInputLore() {
  const { corruption, addCorruption, lore } = useMutation();
  const [value, setValue] = useState("");
  const [flash, setFlash] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = value.trim();
      if (!text) return;

      try {
        await fetch("/api/lore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lore: lore, userInput: text }),
        });
      } catch {
        // swallow
      }

      setValue("");
      addCorruption(8);

      // Flash feedback
      setFlash(true);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlash(false), 600);
    },
    [value, lore, addCorruption]
  );

  if (corruption < 25) return null;

  const glitchClass = getGlitchClass(corruption);

  return (
    <>
      <style>{`
        .qwunk-user-input-bar {
          position: fixed;
          bottom: 32px;
          left: 0;
          right: 0;
          z-index: 9992;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        .qwunk-user-input-bar form {
          pointer-events: auto;
          width: 100%;
          max-width: 480px;
          padding: 0 16px;
        }
        .qwunk-user-input {
          width: 100%;
          font-family: monospace;
          font-size: 12px;
          padding: 6px 10px;
          background: rgba(0, 0, 0, 0.85);
          color: #aaa;
          border: 1px solid #333;
          border-radius: 3px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;
        }
        .qwunk-user-input::placeholder {
          color: #555;
        }
        .qwunk-user-input:focus {
          border-color: #666;
          color: #ccc;
        }
        .qwunk-user-input-flash {
          border-color: #0f0 !important;
          box-shadow: 0 0 8px rgba(0, 255, 0, 0.4);
        }

        .qwunk-input-glitch-1 {
          animation: qwunkInputGlitch1 4s infinite;
        }
        .qwunk-input-glitch-2 {
          animation: qwunkInputGlitch2 2s infinite;
          border-color: #553 !important;
        }
        .qwunk-input-glitch-3 {
          animation: qwunkInputGlitch3 0.8s infinite;
          border-color: #a00 !important;
          color: #f44 !important;
          text-shadow: 0 0 3px rgba(255, 0, 0, 0.5);
        }
        .qwunk-input-glitch-3::placeholder {
          color: #a44 !important;
        }

        @keyframes qwunkInputGlitch1 {
          0%, 95%, 100% { transform: none; }
          96% { transform: translateX(-1px); }
          97% { transform: translateX(1px); }
        }
        @keyframes qwunkInputGlitch2 {
          0%, 90%, 100% { transform: none; opacity: 1; }
          91% { transform: translateX(-2px) skewX(-1deg); opacity: 0.9; }
          93% { transform: translateX(2px) skewX(1deg); opacity: 0.95; }
        }
        @keyframes qwunkInputGlitch3 {
          0%, 80%, 100% { transform: none; opacity: 1; }
          82% { transform: translateX(-3px) skewX(-3deg); opacity: 0.7; }
          84% { transform: translateX(3px) skewX(2deg); opacity: 0.85; }
          86% { transform: translateX(-1px); opacity: 0.9; }
        }
      `}</style>
      <div className="qwunk-user-input-bar">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className={`qwunk-user-input ${glitchClass} ${flash ? "qwunk-user-input-flash" : ""}`}
            placeholder={getPlaceholder(corruption)}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </>
  );
}
