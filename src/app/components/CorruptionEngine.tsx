"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "./MutationContext";

/**
 * CorruptionEngine — drives whole-page visual degradation via CSS custom
 * properties and DOM overlays. No API calls. Instant. Everywhere.
 *
 * Corruption 0→100 over ~45s. 10 visible stages. Each one unmissable.
 */
export default function CorruptionEngine() {
  const { corruption, phase } = useMutation();
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleAnimRef = useRef<number>(0);
  const prevStageRef = useRef(0);

  // ── Apply CSS custom properties every time corruption changes ──
  useEffect(() => {
    const root = document.documentElement;
    const c = corruption;

    // Smooth interpolations
    root.style.setProperty("--c", String(c));

    // Color: warm shift early, then wild
    const hue = c < 50 ? c * 0.6 : 30 + (c - 50) * 2;
    root.style.setProperty("--c-hue", `${hue}deg`);

    // Saturation ramps up
    root.style.setProperty("--c-saturate", `${1 + c * 0.012}`);

    // Brightness dims in the middle, then goes dark
    const brightness = c < 40 ? 1 : c < 70 ? 1 - (c - 40) * 0.008 : 0.76;
    root.style.setProperty("--c-brightness", String(brightness));

    // Contrast increases
    root.style.setProperty("--c-contrast", `${1 + c * 0.004}`);

    // Sepia for warmth early on
    const sepia = c < 40 ? c * 0.004 : Math.max(0, 0.16 - (c - 40) * 0.004);
    root.style.setProperty("--c-sepia", String(sepia));

    // Blur: very subtle, creeps in
    root.style.setProperty("--c-blur", `${Math.max(0, (c - 60) * 0.015)}px`);

    // Rotation/skew on body
    root.style.setProperty("--c-rotate", `${(c > 30 ? (c - 30) * 0.03 : 0)}deg`);
    root.style.setProperty("--c-skew", `${(c > 40 ? (c - 40) * 0.02 : 0)}deg`);

    // Noise overlay opacity
    root.style.setProperty("--c-noise", String(c > 25 ? Math.min((c - 25) * 0.004, 0.18) : 0));

    // Scanline opacity
    root.style.setProperty("--c-scanline", String(c > 20 ? Math.min((c - 20) * 0.003, 0.12) : 0));

    // Glitch intensity (0-1)
    root.style.setProperty("--c-glitch", String(c > 50 ? Math.min((c - 50) * 0.02, 1) : 0));

    // Dark mode blend (0-1)
    const dark = c < 45 ? 0 : Math.min((c - 45) * 0.035, 1);
    root.style.setProperty("--c-dark", String(dark));

    // Neon accent opacity
    root.style.setProperty("--c-neon", String(c > 55 ? Math.min((c - 55) * 0.025, 1) : 0));

    // Set discrete stage (0-10)
    const stage = Math.min(10, Math.floor(c / 10));
    root.setAttribute("data-corruption-stage", String(stage));

    // Body class for phase
    if (c >= 90) {
      document.body.classList.add("corruption-extreme");
    } else if (c >= 60) {
      document.body.classList.add("corruption-heavy");
      document.body.classList.remove("corruption-extreme");
    } else if (c >= 30) {
      document.body.classList.add("corruption-medium");
      document.body.classList.remove("corruption-heavy");
    } else if (c >= 10) {
      document.body.classList.add("corruption-light");
      document.body.classList.remove("corruption-medium");
    }
  }, [corruption]);

  // Noise canvas removed — it was stacking opaque pixels and blacking out the page

  // ── Particle canvas overlay ──
  const setupParticles = useCallback(() => {
    if (particleCanvasRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9997;opacity:0;transition:opacity 1s;";
    canvas.id = "corruption-particles";
    document.body.appendChild(canvas);
    particleCanvasRef.current = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; hue: number; life: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 1,
        hue: Math.random() * 360,
        life: Math.random() * 200,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.hue += 0.5;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.6)`;
        ctx.fill();
      }
      particleAnimRef.current = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
  }, []);

  // ── Spawn/update overlays at thresholds ──
  useEffect(() => {
    const c = corruption;
    const stage = Math.min(10, Math.floor(c / 10));

    // Stage 7+ (c>=65): particles
    if (c >= 65 && !particleCanvasRef.current) {
      setupParticles();
    }
    if (particleCanvasRef.current) {
      particleCanvasRef.current.style.opacity = String(
        Math.min((c - 65) * 0.02, 0.4)
      );
    }

    // Log stage transitions for debugging
    if (stage !== prevStageRef.current) {
      prevStageRef.current = stage;
    }
  }, [corruption, setupParticles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      particleCanvasRef.current?.remove();
      cancelAnimationFrame(particleAnimRef.current);
    };
  }, []);

  // ── Scanline overlay (pure CSS, always mounted) ──
  return (
    <>
      {/* Scanline overlay */}
      <div
        className="corruption-scanline"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9996,
          pointerEvents: "none",
          opacity: corruption > 20 ? Math.min((corruption - 20) * 0.015, 0.4) : 0,
          transition: "opacity 0.5s",
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.06) 2px,
            rgba(0,0,0,0.06) 4px
          )`,
          mixBlendMode: "multiply",
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9995,
          pointerEvents: "none",
          opacity: corruption > 35 ? Math.min((corruption - 35) * 0.015, 0.6) : 0,
          transition: "opacity 1s",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      {/* Color bleed overlay */}
      {corruption > 55 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9994,
            pointerEvents: "none",
            opacity: Math.min((corruption - 55) * 0.012, 0.3),
            background: `linear-gradient(${corruption * 3}deg,
              hsla(${corruption * 2}, 70%, 50%, 0.1) 0%,
              transparent 40%,
              hsla(${corruption * 3 + 120}, 60%, 40%, 0.08) 100%)`,
            mixBlendMode: "screen",
            transition: "opacity 0.5s",
          }}
        />
      )}
    </>
  );
}
