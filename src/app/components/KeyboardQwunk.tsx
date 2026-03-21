"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "./MutationContext";

export default function KeyboardQwunk() {
  const { addCorruption, corruption } = useMutation();
  const keystrokeCount = useRef(0);
  const corruptionRef = useRef(corruption);
  useEffect(() => {
    corruptionRef.current = corruption;
  }, [corruption]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier-only keys
      if (["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;

      keystrokeCount.current += 1;
      const amount = 1 + Math.round(Math.random());
      addCorruption(amount);

      // Every 5th keystroke: ripple effect
      if (keystrokeCount.current % 5 === 0) {
        spawnRipple();
      }

      // At corruption > 50, 10% chance of text echo
      if (corruptionRef.current > 50 && Math.random() < 0.1) {
        spawnTextEcho(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addCorruption]);

  return null;
}

function spawnRipple() {
  const div = document.createElement("div");
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  Object.assign(div.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: "0px",
    height: "0px",
    borderRadius: "50%",
    border: "2px solid rgba(180, 60, 255, 0.7)",
    pointerEvents: "none",
    zIndex: "9999",
    transform: "translate(-50%, -50%)",
    animation: "qwunk-ripple 500ms ease-out forwards",
  });
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 500);

  // Inject keyframes if not already present
  if (!document.getElementById("qwunk-ripple-style")) {
    const style = document.createElement("style");
    style.id = "qwunk-ripple-style";
    style.textContent = `
      @keyframes qwunk-ripple {
        0% { width: 0px; height: 0px; opacity: 1; }
        100% { width: 200px; height: 200px; opacity: 0; }
      }
      @keyframes qwunk-text-echo {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-60px); }
      }
    `;
    document.head.appendChild(style);
  }
}

function spawnTextEcho(key: string) {
  const span = document.createElement("span");
  span.textContent = key;
  const x = Math.random() * (window.innerWidth - 40) + 20;
  const y = Math.random() * 120 + 20;
  Object.assign(span.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    pointerEvents: "none",
    zIndex: "9999",
    color: "rgba(200, 80, 255, 0.9)",
    fontSize: "24px",
    fontFamily: "monospace",
    fontWeight: "bold",
    animation: "qwunk-text-echo 1s ease-out forwards",
  });
  document.body.appendChild(span);
  setTimeout(() => span.remove(), 1000);

  // Ensure keyframes exist (in case ripple hasn't fired yet)
  if (!document.getElementById("qwunk-ripple-style")) {
    spawnRipple(); // side-effect: injects the style sheet
  }
}
