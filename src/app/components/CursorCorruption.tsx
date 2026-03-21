"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "./MutationContext";

// ── Inline SVG cursors as data URIs ──

/** Stage 1 (15-30): slightly enlarged crosshair */
const CROSSHAIR_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <line x1="16" y1="4" x2="16" y2="28" stroke="white" stroke-width="1.5" opacity="0.7"/>
    <line x1="4" y1="16" x2="28" y2="16" stroke="white" stroke-width="1.5" opacity="0.7"/>
    <circle cx="16" cy="16" r="3" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
    <circle cx="16" cy="16" r="1" fill="white" opacity="0.8"/>
  </svg>`
)}`;

/** Stage 2 (30-50): glitchy cross generated on a canvas */
function makeGlitchyCursorURL(corruption: number): string {
  const size = 32;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;

  const offset = ((corruption - 30) / 20) * 4; // 0-4px offset
  const glitchR = Math.random() * 2;

  // Main cross
  ctx.strokeStyle = `rgba(255, ${180 - corruption * 2}, ${100 - corruption}, 0.9)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 2 + glitchR);
  ctx.lineTo(16 + offset, 30 - glitchR);
  ctx.moveTo(2 + glitchR, 16);
  ctx.lineTo(30 - glitchR, 16 + offset);
  ctx.stroke();

  // Glitch lines
  ctx.strokeStyle = `rgba(255, 0, ${200 - corruption * 2}, 0.6)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16 - offset, 6);
  ctx.lineTo(16 + offset, 26);
  ctx.stroke();

  // Center dot
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(16, 16, 2, 0, Math.PI * 2);
  ctx.fill();

  return c.toDataURL();
}

// ── Spring physics for centipede segments ──

interface Segment {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
}

function createSegments(count: number, x: number, y: number): Segment[] {
  return Array.from({ length: count }, () => ({
    x,
    y,
    vx: 0,
    vy: 0,
    angle: 0,
  }));
}

function updateSegments(
  segments: Segment[],
  targetX: number,
  targetY: number,
  stiffness: number,
  damping: number
) {
  let tx = targetX;
  let ty = targetY;
  for (const seg of segments) {
    const dx = tx - seg.x;
    const dy = ty - seg.y;
    seg.vx += dx * stiffness;
    seg.vy += dy * stiffness;
    seg.vx *= damping;
    seg.vy *= damping;
    seg.x += seg.vx;
    seg.y += seg.vy;
    seg.angle = Math.atan2(dy, dx);
    tx = seg.x;
    ty = seg.y;
  }
}

// ── Main component ──

export default function CursorCorruption() {
  const { corruption } = useMutation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const segmentsRef = useRef<Segment[]>([]);
  const timeRef = useRef(0);
  const trailsRef = useRef<Array<{ x: number; y: number; age: number; r: number }>>([]);
  const spawnedRef = useRef<HTMLDivElement[]>([]);

  // Track corruption in a ref so the animation loop always sees the latest
  const corruptionRef = useRef(corruption);
  corruptionRef.current = corruption;

  const getOrCreateCanvas = useCallback((): HTMLCanvasElement => {
    if (canvasRef.current) return canvasRef.current;
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    canvasRef.current = canvas;
    return canvas;
  }, []);

  useEffect(() => {
    // ── Mouse tracking ──
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize handler ──
    const onResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", onResize);

    // Initialise segments for centipede
    segmentsRef.current = createSegments(16, mouseRef.current.x, mouseRef.current.y);

    // ── Animation loop ──
    const animate = () => {
      const c = corruptionRef.current;
      timeRef.current += 0.016; // ~60fps assumed
      const t = timeRef.current;

      // ── Cursor style on body ──
      if (c < 15) {
        document.body.style.cursor = "";
      } else if (c < 30) {
        document.body.style.cursor = `url('${CROSSHAIR_SVG}') 16 16, crosshair`;
      } else if (c < 50) {
        const url = makeGlitchyCursorURL(c);
        document.body.style.cursor = `url('${url}') 16 16, crosshair`;
      } else if (c < 90) {
        document.body.style.cursor = "none";
      } else {
        document.body.style.cursor = "none";
      }

      // ── Canvas-based effects (corruption >= 50) ──
      if (c >= 50) {
        const canvas = getOrCreateCanvas();
        const ctx = canvas.getContext("2d")!;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;

        // For chaos stage: don't clear (permanent trails)
        if (c >= 90) {
          ctx.fillStyle = "rgba(0,0,0,0.03)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (c < 70) {
          // ── Stage 3 (50-70): pulsing circle that trails ──
          const pulse = Math.sin(t * 6) * 0.5 + 0.5; // 0..1
          const radius = 8 + pulse * 8;
          const alpha = 0.5 + pulse * 0.3;

          // Trail
          trailsRef.current.push({ x: mx, y: my, age: 0, r: radius * 0.6 });
          if (trailsRef.current.length > 20) trailsRef.current.shift();

          for (const pt of trailsRef.current) {
            pt.age += 0.05;
            const a = Math.max(0, 0.4 - pt.age * 0.5);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(180, 120, 255, ${a})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Main ring
          ctx.beginPath();
          ctx.arc(mx, my, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200, 150, 255, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Inner dot
          ctx.beginPath();
          ctx.arc(mx, my, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        } else {
          // ── Stage 4+ (70-90, 90+): centipede creature ──
          const segCount = c >= 90 ? 16 : Math.floor(8 + ((c - 70) / 20) * 8);
          const stiffness = c >= 90 ? 0.08 : 0.12;
          const damping = c >= 90 ? 0.75 : 0.8;

          // Ensure enough segments
          while (segmentsRef.current.length < segCount) {
            const last = segmentsRef.current[segmentsRef.current.length - 1];
            segmentsRef.current.push({ x: last.x, y: last.y, vx: 0, vy: 0, angle: 0 });
          }

          updateSegments(
            segmentsRef.current.slice(0, segCount),
            mx,
            my,
            stiffness,
            damping
          );

          // Draw creature
          for (let i = 0; i < segCount; i++) {
            const seg = segmentsRef.current[i];
            const progress = i / segCount;
            const segSize = (1 - progress * 0.6) * (c >= 90 ? 10 : 7);
            const wobble = Math.sin(t * 8 + i * 0.7) * 2;

            // Body segment
            ctx.beginPath();
            ctx.ellipse(
              seg.x + Math.cos(seg.angle + Math.PI / 2) * wobble,
              seg.y + Math.sin(seg.angle + Math.PI / 2) * wobble,
              segSize,
              segSize * 0.7,
              seg.angle,
              0,
              Math.PI * 2
            );

            const hue = (280 + i * 8 + t * 60) % 360;
            const sat = c >= 90 ? 90 : 70;
            const light = c >= 90 ? 55 : 45;
            ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${0.8 - progress * 0.4})`;
            ctx.fill();

            // Legs (every other segment)
            if (i % 2 === 0) {
              const legLen = segSize * 1.8;
              const legWobble = Math.sin(t * 12 + i) * 0.5;
              ctx.strokeStyle = `hsla(${hue}, 60%, 50%, 0.6)`;
              ctx.lineWidth = 1.5;
              for (const side of [-1, 1]) {
                const lx = seg.x + Math.cos(seg.angle + (Math.PI / 2) * side) * legLen;
                const ly = seg.y + Math.sin(seg.angle + (Math.PI / 2) * side + legWobble) * legLen;
                ctx.beginPath();
                ctx.moveTo(seg.x, seg.y);
                ctx.lineTo(lx, ly);
                ctx.stroke();
              }
            }

            // Eyes on head segment
            if (i === 0) {
              for (const side of [-1, 1]) {
                const ex = seg.x + Math.cos(seg.angle + 0.4 * side) * segSize * 0.6;
                const ey = seg.y + Math.sin(seg.angle + 0.4 * side) * segSize * 0.6;
                ctx.beginPath();
                ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = c >= 90 ? "rgba(255,50,50,0.95)" : "rgba(255,200,200,0.9)";
                ctx.fill();
                // Pupil
                ctx.beginPath();
                ctx.arc(ex, ey, 1, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0,0,0,0.9)";
                ctx.fill();
              }
            }
          }

          // ── Stage 5 (90+): chaos extras ──
          if (c >= 90) {
            // Permanent trail marks
            if (Math.random() < 0.3) {
              trailsRef.current.push({
                x: mx + (Math.random() - 0.5) * 40,
                y: my + (Math.random() - 0.5) * 40,
                age: 0,
                r: 2 + Math.random() * 6,
              });
            }
            // Keep trails bounded but large
            if (trailsRef.current.length > 500) {
              trailsRef.current.splice(0, 50);
            }

            // Draw permanent trails
            for (const pt of trailsRef.current) {
              pt.age += 0.002;
              const a = Math.max(0.05, 0.6 - pt.age * 0.1);
              const hue = (pt.x * 0.5 + pt.y * 0.3 + t * 40) % 360;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
              ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${a})`;
              ctx.fill();
            }

            // Spawn mini DOM elements occasionally
            if (Math.random() < 0.02 && spawnedRef.current.length < 30) {
              const el = document.createElement("div");
              el.style.position = "fixed";
              el.style.left = `${mx + (Math.random() - 0.5) * 80}px`;
              el.style.top = `${my + (Math.random() - 0.5) * 80}px`;
              el.style.pointerEvents = "none";
              el.style.zIndex = "99998";
              el.style.fontSize = `${10 + Math.random() * 14}px`;
              el.style.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
              el.style.opacity = "0.8";
              el.style.transition = "opacity 3s, transform 3s";
              el.style.transform = "scale(1)";
              const glyphs = ["\u2588", "\u2593", "\u2591", "\u25A0", "\u25CF", "\u2666", "\u2620", "\u2302", "\u03A8", "\u0416"];
              el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
              document.body.appendChild(el);
              spawnedRef.current.push(el);

              // Fade out and drift
              requestAnimationFrame(() => {
                el.style.opacity = "0";
                el.style.transform = `scale(0.3) translateY(${Math.random() > 0.5 ? "-" : ""}60px)`;
              });

              // Remove after fade
              setTimeout(() => {
                el.remove();
                spawnedRef.current = spawnedRef.current.filter((e) => e !== el);
              }, 3500);
            }
          }
        }
      } else {
        // Below 50: remove canvas if it exists
        if (canvasRef.current) {
          canvasRef.current.remove();
          canvasRef.current = null;
        }
        trailsRef.current = [];
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // ── Cleanup ──
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafRef.current);
      document.body.style.cursor = "";
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
      // Clean up any spawned elements
      for (const el of spawnedRef.current) {
        el.remove();
      }
      spawnedRef.current = [];
    };
  }, [getOrCreateCanvas]);

  // This component renders nothing itself
  return null;
}
