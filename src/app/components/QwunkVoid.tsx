"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  z: number;
  ox: number;
  oy: number;
  oz: number;
  sx: number;
  sy: number;
}

export default function QwunkVoid({ chaosMode }: { chaosMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chaosModeRef = useRef(chaosMode);

  useEffect(() => {
    chaosModeRef.current = chaosMode;
  }, [chaosMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // nodes for wireframe shapes
    const nodeCount = 120;
    const nodes: Node[] = [];
    const edges: [number, number][] = [];

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 200 + Math.random() * 300;
      nodes.push({
        x: 0, y: 0, z: 0,
        ox: r * Math.sin(phi) * Math.cos(theta),
        oy: r * Math.sin(phi) * Math.sin(theta),
        oz: r * Math.cos(phi),
        sx: 0, sy: 0,
      });
    }

    // connect nearby nodes
    for (let i = 0; i < nodeCount; i++) {
      const dists: { idx: number; d: number }[] = [];
      for (let j = 0; j < nodeCount; j++) {
        if (i === j) continue;
        const dx = nodes[i].ox - nodes[j].ox;
        const dy = nodes[i].oy - nodes[j].oy;
        const dz = nodes[i].oz - nodes[j].oz;
        dists.push({ idx: j, d: Math.sqrt(dx * dx + dy * dy + dz * dz) });
      }
      dists.sort((a, b) => a.d - b.d);
      for (let k = 0; k < 3; k++) {
        const pair: [number, number] = [Math.min(i, dists[k].idx), Math.max(i, dists[k].idx)];
        if (!edges.some(([a, b]) => a === pair[0] && b === pair[1])) {
          edges.push(pair);
        }
      }
    }

    // floating particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; color: string }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 200,
        color: Math.random() > 0.5 ? "#ff00ff" : "#00ffff",
      });
    }

    let time = 0;

    const project = (x: number, y: number, z: number): [number, number, number] => {
      const fov = 600;
      const scale = fov / (fov + z);
      return [x * scale + w / 2, y * scale + h / 2, scale];
    };

    const animate = () => {
      time += 0.008;
      const chaos = chaosModeRef.current;
      const rotSpeed = chaos ? 0.015 : 0.005;

      ctx.fillStyle = `rgba(5, 5, 5, ${chaos ? 0.08 : 0.12})`;
      ctx.fillRect(0, 0, w, h);

      // rotate and project nodes
      const cosY = Math.cos(time * rotSpeed * 3);
      const sinY = Math.sin(time * rotSpeed * 3);
      const cosX = Math.cos(time * rotSpeed * 2);
      const sinX = Math.sin(time * rotSpeed * 2);
      const cosZ = Math.cos(time * rotSpeed);
      const sinZ = Math.sin(time * rotSpeed);

      for (const node of nodes) {
        let { ox, oy, oz } = node;

        // breathe
        const breathe = chaos ? Math.sin(time * 2) * 40 + 20 : Math.sin(time * 0.5) * 15;
        const r = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const nr = r + breathe;
        const scale = nr / r;
        ox *= scale;
        oy *= scale;
        oz *= scale;

        // rotate Y
        let x1 = ox * cosY - oz * sinY;
        let z1 = ox * sinY + oz * cosY;
        // rotate X
        let y1 = oy * cosX - z1 * sinX;
        let z2 = oy * sinX + z1 * cosX;
        // rotate Z
        let x2 = x1 * cosZ - y1 * sinZ;
        let y2 = x1 * sinZ + y1 * cosZ;

        node.x = x2;
        node.y = y2;
        node.z = z2;
        const [sx, sy] = project(x2, y2, z2);
        node.sx = sx;
        node.sy = sy;
      }

      // draw edges
      for (const [i, j] of edges) {
        const a = nodes[i];
        const b = nodes[j];
        const [, , sa] = project(a.x, a.y, a.z);
        const [, , sb] = project(b.x, b.y, b.z);
        const avgScale = (sa + sb) / 2;
        const alpha = Math.min(avgScale * 0.6, 0.25) * (chaos ? 2 : 1);

        const hue = chaos
          ? (time * 50 + i * 3) % 360
          : i % 2 === 0 ? 300 : 180;

        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
        ctx.lineWidth = avgScale * (chaos ? 2 : 1.2);
        ctx.stroke();
      }

      // draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const [, , s] = project(node.x, node.y, node.z);
        const size = s * (chaos ? 3 : 2);
        const alpha = Math.min(s * 0.8, 0.7);

        const hue = chaos ? (time * 80 + i * 5) % 360 : i % 2 === 0 ? 300 : 180;

        ctx.beginPath();
        ctx.arc(node.sx, node.sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
        ctx.fill();

        // glow
        if (chaos && Math.random() > 0.95) {
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, size * 4, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.15)`;
          ctx.fill();
        }
      }

      // particles
      for (const p of particles) {
        p.x += p.vx * (chaos ? 3 : 1);
        p.y += p.vy * (chaos ? 3 : 1);
        p.life++;
        if (p.life > p.maxLife || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.life = 0;
        }
        const fadeIn = Math.min(p.life / 30, 1);
        const fadeOut = Math.min((p.maxLife - p.life) / 30, 1);
        const alpha = fadeIn * fadeOut * (chaos ? 0.8 : 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (chaos ? 2 : 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
        // hex to rgba hack
        const r = parseInt(p.color.slice(1, 3), 16);
        const g = parseInt(p.color.slice(3, 5), 16);
        const b = parseInt(p.color.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      // chaos: random glitch rectangles
      if (chaos && Math.random() > 0.92) {
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        const gw = Math.random() * 200 + 50;
        const gh = Math.random() * 10 + 2;
        ctx.fillStyle = `rgba(${Math.random() > 0.5 ? "255,0,255" : "0,255,255"}, ${Math.random() * 0.15})`;
        ctx.fillRect(gx, gy, gw, gh);
      }

      // subtle vignette
      const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(1, "rgba(5,5,5,0.4)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ pointerEvents: "none" }}
    />
  );
}
