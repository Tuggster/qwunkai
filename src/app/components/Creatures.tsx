"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "./MutationContext";

interface Creature {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: "crawler" | "floater" | "dasher" | "worm";
  hue: number;
  phase: number;
  trail: { x: number; y: number }[];
  legs: number;
  wiggle: number;
  targetX: number;
  targetY: number;
  lifetime: number;
}

/**
 * Pure canvas creature layer. No LLM needed.
 * Spawns at corruption 20, gets more intense as corruption rises.
 * Lives OUTSIDE root zone — persists through everything.
 */
export default function Creatures() {
  const { corruption } = useMutation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const creaturesRef = useRef<Creature[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const corruptionRef = useRef(0);

  useEffect(() => {
    corruptionRef.current = corruption;
  }, [corruption]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);

    const spawnCreature = (): Creature => {
      const types: Creature["type"][] = ["crawler", "floater", "dasher", "worm"];
      const type = types[Math.floor(Math.random() * types.length)];
      const edge = Math.floor(Math.random() * 4);
      let x: number, y: number;
      if (edge === 0) { x = -20; y = Math.random() * h; }
      else if (edge === 1) { x = w + 20; y = Math.random() * h; }
      else if (edge === 2) { x = Math.random() * w; y = -20; }
      else { x = Math.random() * w; y = h + 20; }

      return {
        x, y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: 4 + Math.random() * 8,
        type,
        hue: Math.random() * 360,
        phase: Math.random() * Math.PI * 2,
        trail: [],
        legs: type === "crawler" ? 6 + Math.floor(Math.random() * 4) : 0,
        wiggle: 0,
        targetX: Math.random() * w,
        targetY: Math.random() * h,
        lifetime: 0,
      };
    };

    const drawCrawler = (ctx: CanvasRenderingContext2D, c: Creature, t: number) => {
      // Body
      ctx.fillStyle = `hsla(${c.hue}, 60%, 45%, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.size * 1.3, c.size * 0.8, Math.atan2(c.vy, c.vx), 0, Math.PI * 2);
      ctx.fill();

      // Legs
      const angle = Math.atan2(c.vy, c.vx);
      for (let i = 0; i < c.legs; i++) {
        const legAngle = angle + Math.PI / 2 + (i % 2 === 0 ? 0.2 : -0.2);
        const side = i < c.legs / 2 ? 1 : -1;
        const legPhase = t * 8 + i * 0.8;
        const legLen = c.size * (1 + Math.sin(legPhase) * 0.3);
        const lx = c.x + Math.cos(legAngle) * legLen * side * 0.8;
        const ly = c.y + Math.sin(legAngle) * legLen * side * 0.8;
        ctx.strokeStyle = `hsla(${c.hue}, 50%, 40%, 0.6)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(lx, ly);
        ctx.stroke();
      }

      // Eyes
      const eyeOff = c.size * 0.4;
      ctx.fillStyle = `hsla(${c.hue + 180}, 80%, 80%, 0.9)`;
      ctx.beginPath();
      ctx.arc(c.x + Math.cos(angle) * eyeOff + Math.cos(angle + 1) * 3, c.y + Math.sin(angle) * eyeOff + Math.sin(angle + 1) * 3, 2, 0, Math.PI * 2);
      ctx.arc(c.x + Math.cos(angle) * eyeOff + Math.cos(angle - 1) * 3, c.y + Math.sin(angle) * eyeOff + Math.sin(angle - 1) * 3, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawFloater = (ctx: CanvasRenderingContext2D, c: Creature, t: number) => {
      // Translucent jellyfish-like thing
      const pulse = 1 + Math.sin(t * 3 + c.phase) * 0.2;
      ctx.fillStyle = `hsla(${c.hue}, 50%, 60%, 0.3)`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Tentacles
      ctx.strokeStyle = `hsla(${c.hue}, 40%, 50%, 0.4)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(c.x, c.y + c.size * pulse);
        const tx = c.x + Math.sin(t * 2 + i * 1.2) * c.size;
        const ty = c.y + c.size * pulse + c.size * 1.5 + Math.sin(t + i) * 5;
        ctx.quadraticCurveTo(c.x + Math.sin(t + i) * c.size * 0.5, c.y + c.size * pulse + c.size, tx, ty);
        ctx.stroke();
      }

      // Inner glow
      ctx.fillStyle = `hsla(${c.hue}, 70%, 70%, 0.5)`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.4 * pulse, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawDasher = (ctx: CanvasRenderingContext2D, c: Creature) => {
      // Fast triangular thing with motion blur trail
      for (let i = c.trail.length - 1; i >= 0; i--) {
        const alpha = (i / c.trail.length) * 0.3;
        const size = c.size * (i / c.trail.length);
        ctx.fillStyle = `hsla(${c.hue}, 70%, 55%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(c.trail[i].x, c.trail[i].y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const angle = Math.atan2(c.vy, c.vx);
      ctx.fillStyle = `hsla(${c.hue}, 80%, 55%, 0.9)`;
      ctx.beginPath();
      ctx.moveTo(c.x + Math.cos(angle) * c.size, c.y + Math.sin(angle) * c.size);
      ctx.lineTo(c.x + Math.cos(angle + 2.5) * c.size * 0.6, c.y + Math.sin(angle + 2.5) * c.size * 0.6);
      ctx.lineTo(c.x + Math.cos(angle - 2.5) * c.size * 0.6, c.y + Math.sin(angle - 2.5) * c.size * 0.6);
      ctx.closePath();
      ctx.fill();
    };

    const drawWorm = (ctx: CanvasRenderingContext2D, c: Creature, t: number) => {
      // Segmented worm
      const segments = 12;
      const segSize = c.size * 0.6;
      ctx.fillStyle = `hsla(${c.hue}, 45%, 50%, 0.7)`;
      for (let i = 0; i < segments; i++) {
        const prevIdx = Math.max(0, c.trail.length - 1 - i * 2);
        const pos = c.trail[prevIdx] || { x: c.x, y: c.y };
        const s = segSize * (1 - i * 0.05) * (1 + Math.sin(t * 5 + i * 0.5) * 0.1);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, s, 0, Math.PI * 2);
        ctx.fill();
      }
      // Head
      ctx.fillStyle = `hsla(${c.hue + 30}, 60%, 60%, 0.9)`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, segSize * 1.2, 0, Math.PI * 2);
      ctx.fill();
    };

    let time = 0;
    const animate = () => {
      time += 0.016;
      const c = corruptionRef.current;
      if (c < 20) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // Target creature count scales with corruption
      const targetCount = Math.floor(((c - 20) / 80) * 20) + 1;
      while (creaturesRef.current.length < targetCount) {
        creaturesRef.current.push(spawnCreature());
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = creaturesRef.current.length - 1; i >= 0; i--) {
        const cr = creaturesRef.current[i];
        cr.lifetime++;

        // Trail
        cr.trail.push({ x: cr.x, y: cr.y });
        if (cr.trail.length > 30) cr.trail.shift();

        // Behavior by type
        if (cr.type === "crawler") {
          // Scurry toward target, avoid mouse
          const dx = cr.targetX - cr.x;
          const dy = cr.targetY - cr.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 20) {
            cr.targetX = Math.random() * w;
            cr.targetY = Math.random() * h;
          }
          cr.vx += (dx / dist) * 0.15;
          cr.vy += (dy / dist) * 0.15;

          // Flee from mouse
          const mdx = cr.x - mx;
          const mdy = cr.y - my;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 150) {
            cr.vx += (mdx / mdist) * 2;
            cr.vy += (mdy / mdist) * 2;
          }

          cr.vx *= 0.95;
          cr.vy *= 0.95;
          drawCrawler(ctx, cr, time);
        } else if (cr.type === "floater") {
          cr.vy += Math.sin(time + cr.phase) * 0.02 - 0.01;
          cr.vx += Math.cos(time * 0.7 + cr.phase) * 0.02;
          cr.vx *= 0.99;
          cr.vy *= 0.99;
          drawFloater(ctx, cr, time);
        } else if (cr.type === "dasher") {
          // Sudden direction changes
          if (Math.random() < 0.02) {
            cr.vx = (Math.random() - 0.5) * 12;
            cr.vy = (Math.random() - 0.5) * 12;
          }
          cr.vx *= 0.98;
          cr.vy *= 0.98;
          drawDasher(ctx, cr);
        } else if (cr.type === "worm") {
          const dx = cr.targetX - cr.x;
          const dy = cr.targetY - cr.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 30) {
            cr.targetX = Math.random() * w;
            cr.targetY = Math.random() * h;
          }
          cr.vx += (dx / dist) * 0.08 + Math.sin(time * 3 + cr.phase) * 0.3;
          cr.vy += (dy / dist) * 0.08 + Math.cos(time * 3 + cr.phase) * 0.3;
          cr.vx *= 0.96;
          cr.vy *= 0.96;
          drawWorm(ctx, cr, time);
        }

        cr.x += cr.vx;
        cr.y += cr.vy;
        cr.hue += 0.1;

        // Remove if way off screen
        if (cr.x < -100 || cr.x > w + 100 || cr.y < -100 || cr.y > h + 100) {
          creaturesRef.current.splice(i, 1);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9990,
        opacity: corruption >= 20 ? Math.min((corruption - 20) * 0.015, 0.85) : 0,
        transition: "opacity 1s",
      }}
    />
  );
}
