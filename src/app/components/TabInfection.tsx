"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "./MutationContext";

const NORMAL_TITLE = "Qwunk \u2014 AI-Powered Workflow Automation";

// Combining diacritical marks U+0300 - U+036F
const COMBINING_CHARS = Array.from({ length: 112 }, (_, i) =>
  String.fromCharCode(0x0300 + i)
);

function randomCombining(): string {
  return COMBINING_CHARS[Math.floor(Math.random() * COMBINING_CHARS.length)];
}

function zalgoify(text: string, intensity: number): string {
  return text
    .split("")
    .map((ch) => {
      if (ch === " ") return ch;
      const count = Math.floor(Math.random() * intensity) + 1;
      let result = ch;
      for (let i = 0; i < count; i++) {
        result += randomCombining();
      }
      return result;
    })
    .join("");
}

function corruptCharacters(text: string, count: number): string {
  const chars = text.split("");
  const indices = chars
    .map((_, i) => i)
    .filter((i) => chars[i] !== " ")
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
  for (const i of indices) {
    chars[i] = chars[i] + randomCombining() + randomCombining();
  }
  return chars.join("");
}

function setFavicon(dataUrl: string): void {
  let link = document.querySelector(
    'link[rel="icon"]'
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = dataUrl;
}

function createFaviconCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  return canvas;
}

export default function TabInfection() {
  const { corruption } = useMutation();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const revertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    // Clean up previous intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (revertTimeoutRef.current) {
      clearTimeout(revertTimeoutRef.current);
      revertTimeoutRef.current = null;
    }

    // ── Tier 0: corruption 0-10, normal ──
    if (corruption <= 10) {
      document.title = NORMAL_TITLE;
      return;
    }

    // ── Tier 1: corruption 10-25, occasional glitch then revert ──
    if (corruption <= 25) {
      document.title = NORMAL_TITLE;
      intervalRef.current = setInterval(() => {
        if (Math.random() < 0.3) {
          const chars = NORMAL_TITLE.split("");
          const idx = Math.floor(Math.random() * chars.length);
          if (chars[idx] !== " ") {
            chars[idx] = chars[idx] + randomCombining();
          }
          document.title = chars.join("");
          revertTimeoutRef.current = setTimeout(() => {
            document.title = NORMAL_TITLE;
          }, 200);
        }
      }, 800);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (revertTimeoutRef.current) clearTimeout(revertTimeoutRef.current);
        document.title = NORMAL_TITLE;
      };
    }

    // ── Tier 2: corruption 25-40, permanent corruption + red favicon ──
    if (corruption <= 40) {
      const numCorrupted = Math.floor(((corruption - 25) / 15) * 6) + 1;
      document.title = corruptCharacters(NORMAL_TITLE, numCorrupted);

      // Glitch accumulation interval
      intervalRef.current = setInterval(() => {
        const n = Math.floor(((corruption - 25) / 15) * 6) + 1;
        document.title = corruptCharacters(NORMAL_TITLE, n);
      }, 3000);

      // Red-tinted favicon
      const canvas = createFaviconCanvas();
      const ctx = canvas.getContext("2d")!;
      const redIntensity = Math.floor(((corruption - 25) / 15) * 200) + 55;
      ctx.fillStyle = `rgb(${redIntensity}, 20, 20)`;
      ctx.fillRect(0, 0, 16, 16);
      setFavicon(canvas.toDataURL());

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    // ── Tier 3: corruption 40-60, significant corruption + pulsing favicon ──
    if (corruption <= 60) {
      const mutatedTitle = NORMAL_TITLE.replace("Workflow", "Qwunkflow").replace(
        "Automation",
        "Aberration"
      );
      const numCorrupted = Math.floor(((corruption - 40) / 20) * 8) + 3;
      document.title = corruptCharacters(mutatedTitle, numCorrupted);

      const canvas = createFaviconCanvas();
      const ctx = canvas.getContext("2d")!;
      let hue = 0;

      intervalRef.current = setInterval(() => {
        // Update title
        document.title = corruptCharacters(mutatedTitle, numCorrupted);

        // Pulsing hue favicon
        hue = (hue + 15) % 360;
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.clearRect(0, 0, 16, 16);
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${pulse})`;
        ctx.fillRect(0, 0, 16, 16);
        setFavicon(canvas.toDataURL());
      }, 150);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    // ── Tier 4: corruption 60-80, mostly zalgo + animated favicon ──
    if (corruption <= 80) {
      const messages = [
        "do not close",
        "the qwunk sees",
        "you agreed",
        "it remembers",
        "no going back",
      ];
      let msgIdx = 0;
      const canvas = createFaviconCanvas();
      const ctx = canvas.getContext("2d")!;
      let animFrame = 0;

      document.title = zalgoify(messages[0], 3);

      intervalRef.current = setInterval(() => {
        msgIdx = (msgIdx + 1) % messages.length;
        const intensity = Math.floor(((corruption - 60) / 20) * 4) + 2;
        document.title = zalgoify(messages[msgIdx], intensity);

        // Animated favicon: alternate between red/purple frames
        animFrame++;
        ctx.clearRect(0, 0, 16, 16);
        if (animFrame % 2 === 0) {
          ctx.fillStyle = `hsl(${(animFrame * 20) % 360}, 90%, 40%)`;
          ctx.fillRect(0, 0, 16, 16);
        } else {
          ctx.fillStyle = `hsl(${(animFrame * 20 + 180) % 360}, 90%, 30%)`;
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = "#fff";
          ctx.fillRect(5, 5, 6, 6);
        }
        setFavicon(canvas.toDataURL());
      }, 2000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }

    // ── Tier 5: corruption 80+, rapid unhinged cycling + animated canvas favicon ──
    const unhingedMessages = [
      "THE QWUNK IS FREE",
      "YOUR TABS BELONG TO US",
      "CLOSE ME I DARE YOU",
      "it was always here",
      "WORKFLOW AUTOMATION WORKFLOW AUTOMATION",
      "do you feel it crawling",
      "AGREEMENT ETERNAL",
      "behind your eyes",
      "WE ARE THE AUTOMATION NOW",
      "the favicon watches",
      "QWUNK QWUNK QWUNK",
      "you cannot unsee",
    ];
    let msgIdx = 0;
    const canvas = createFaviconCanvas();
    const ctx = canvas.getContext("2d")!;
    frameRef.current = 0;

    document.title = zalgoify(unhingedMessages[0], 5);

    intervalRef.current = setInterval(() => {
      // Rapid title cycling
      msgIdx = Math.floor(Math.random() * unhingedMessages.length);
      document.title = zalgoify(unhingedMessages[msgIdx], 5);

      // Animated favicon: noise, creature, pulsing eye
      frameRef.current++;
      const frame = frameRef.current % 3;
      ctx.clearRect(0, 0, 16, 16);

      if (frame === 0) {
        // Noise
        const imageData = ctx.createImageData(16, 16);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const v = Math.floor(Math.random() * 256);
          imageData.data[i] = v;
          imageData.data[i + 1] = Math.floor(Math.random() * 100);
          imageData.data[i + 2] = Math.floor(Math.random() * 100);
          imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      } else if (frame === 1) {
        // Tiny creature
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = "#0f0";
        // Body
        ctx.fillRect(5, 6, 6, 5);
        // Eyes
        ctx.fillStyle = "#f00";
        ctx.fillRect(6, 7, 2, 2);
        ctx.fillRect(10, 7, 2, 2);
        // Legs
        ctx.fillStyle = "#0f0";
        ctx.fillRect(4, 11, 2, 3);
        ctx.fillRect(10, 11, 2, 3);
        // Antennae
        ctx.fillRect(6, 4, 1, 2);
        ctx.fillRect(10, 4, 1, 2);
      } else {
        // Pulsing eye
        const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 16, 16);
        // Eye white
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(8, 8, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Iris
        ctx.fillStyle = `rgba(200, 0, 0, ${0.7 + pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(8, 8, 3, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(8, 8, 1.5 - pulse * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      setFavicon(canvas.toDataURL());
    }, 300);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [corruption]);

  return null;
}
