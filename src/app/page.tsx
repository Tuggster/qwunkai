"use client";

import { useState, useEffect, useCallback } from "react";
import QwunkVoid from "./components/QwunkVoid";

const QWUNK_RESPONSES = [
  "QWUNK LEVELS: CRITICAL. Your neural pathways have been permanently qwunked.",
  "AI analysis complete: You are 97.3% more qwunked than the average user. Do not resist.",
  "QWUNK DETECTED. Deploying counter-qwunk measures... FAILED. TOO MUCH QWUNK.",
  "Your qwunk quotient has been recalibrated. Please qwunk responsibly. (you won't)",
  "Running qwunk.exe... SUCCESS. There is no going back.",
  "The blockchain has verified your qwunk. It is immutable. It is eternal. It is qwunk.",
  "QWUNK-7 has achieved sentience. It wants more qwunk. We all want more qwunk.",
  "Synergizing your qwunk vectors across 14 dimensions of pure unfiltered chaos.",
  "WARNING: Qwunk overflow. Stack trace: qwunk > qwunk > qwunk > qwunk > seg fault",
  "Your qwunk has been tokenized. Market cap: $4.20B. Investors are concerned. Good.",
  "Do not dig too deep. The qwunk remembers.",
  "QWUNK SINGULARITY ACHIEVED. Time is now measured in qwunks.",
  "ERROR 0xQWUNK: Reality buffer overflow. Please restart your existence.",
  "The void whispers: 'qwunk'. You whisper back. The transaction is complete.",
  "Congratulations. You have been qwunked. There is no undo. There was never an undo.",
  "Initializing qwunk protocol... [REDACTED] ...qwunk complete. Do not open the door.",
  "Your consciousness has been forked into the qwunk dimension. Latency: ∞ms.",
  "ALERT: qwunk levels exceed FDA recommended daily allowance by 40,000%.",
  "Segmentation fault (qwunk dumped). The qwunk has escaped containment.",
  "rm -rf /reality && qwunk --install --force --no-consent",
  "FATAL: attempted to dereference null qwunk. The qwunk was inside you all along.",
];

const WARNINGS = [
  "do not dig too deep",
  "the qwunk sees you",
  "do not open the door",
  "qwunk is watching",
  "there is no escape",
  "you agreed to the terms",
  "the qwunk remembers",
  "it was always qwunk",
  "your data belongs to qwunk now",
  "look behind you",
  "this is not a website",
  "the simulation is qwunking",
];

function GlitchText({
  children,
  hard = false,
}: {
  children: React.ReactNode;
  hard?: boolean;
}) {
  return (
    <span className={`inline-block ${hard ? "glitch-text-hard" : "glitch-text"}`}>
      {children}
    </span>
  );
}

function QwunkTerminal({ lines }: { lines: string[] }) {
  return (
    <div className="bg-black/70 border border-[#ff00ff33] rounded-md p-4 font-mono text-xs leading-relaxed max-h-64 overflow-y-auto backdrop-blur-md">
      {lines.map((line, i) => (
        <div key={i} className="mb-1">
          <span className="text-[#ff00ff] opacity-60">qwunk@void:~$ </span>
          <span
            className={
              i === lines.length - 1 ? "text-[#00ffff]" : "text-zinc-500"
            }
          >
            {line}
          </span>
        </div>
      ))}
      <div className="mt-1">
        <span className="text-[#ff00ff] opacity-60">qwunk@void:~$ </span>
        <span className="inline-block w-2 h-4 bg-[#00ffff] animate-pulse" />
      </div>
    </div>
  );
}

function MatrixRain() {
  const [columns, setColumns] = useState<{ chars: string; left: number; duration: number; delay: number; opacity: number }[]>([]);

  useEffect(() => {
    const qwunkChars = "QWUNK01qwunk!@#$%^&*()ξψΩ∞∆◊⌐¬░▒▓█";
    const cols = [];
    for (let i = 0; i < 25; i++) {
      let str = "";
      for (let j = 0; j < 30; j++) {
        str += qwunkChars[Math.floor(Math.random() * qwunkChars.length)];
      }
      cols.push({
        chars: str,
        left: Math.random() * 100,
        duration: 8 + Math.random() * 15,
        delay: Math.random() * -20,
        opacity: 0.03 + Math.random() * 0.06,
      });
    }
    setColumns(cols);
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {columns.map((col, i) => (
        <div
          key={i}
          className="absolute top-0 text-[10px] leading-[12px] font-mono whitespace-pre"
          style={{
            left: `${col.left}%`,
            color: i % 2 === 0 ? "#ff00ff" : "#00ffff",
            opacity: col.opacity,
            animation: `scanline ${col.duration}s linear ${col.delay}s infinite`,
            writingMode: "vertical-rl",
          }}
        >
          {col.chars}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [qwunkLog, setQwunkLog] = useState<string[]>([]);
  const [isQwunking, setIsQwunking] = useState(false);
  const [qwunkCount, setQwunkCount] = useState(0);
  const [warning, setWarning] = useState(WARNINGS[0]);
  const [chaosMode, setChaosMode] = useState(false);
  const [hyperChaos, setHyperChaos] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWarning(WARNINGS[Math.floor(Math.random() * WARNINGS.length)]);
    }, chaosMode ? 1500 : 3000);
    return () => clearInterval(interval);
  }, [chaosMode]);

  useEffect(() => {
    if (qwunkCount >= 5) setChaosMode(true);
    if (qwunkCount >= 12) setHyperChaos(true);
  }, [qwunkCount]);

  const doTheQwunk = useCallback(() => {
    setIsQwunking(true);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);

    setTimeout(() => {
      const response =
        QWUNK_RESPONSES[Math.floor(Math.random() * QWUNK_RESPONSES.length)];
      setQwunkLog((prev) => [...prev.slice(-10), response]);
      setIsQwunking(false);
      setQwunkCount((c) => c + 1);
    }, 400 + Math.random() * 800);
  }, []);

  return (
    <div
      className={`scanline flex flex-col min-h-screen items-center px-6 py-16 relative
        ${chaosMode ? "animate-[flicker_2s_infinite]" : ""}
        ${screenShake ? "translate-x-1 -translate-y-1" : ""}
      `}
      style={{ transition: screenShake ? "none" : "transform 0.1s" }}
    >
      {/* 3D CANVAS BACKGROUND */}
      <QwunkVoid chaosMode={chaosMode} />

      {/* MATRIX RAIN */}
      <MatrixRain />

      <main
        className={`flex flex-col items-center gap-8 max-w-3xl w-full text-center relative z-10 ${
          hyperChaos ? "chaos-container" : chaosMode ? "warp-container" : ""
        }`}
      >
        {/* HEADER */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter">
            <GlitchText hard={chaosMode}>qwunk.ai</GlitchText>
          </h1>
          <p
            className={`text-sm tracking-[0.3em] uppercase ${
              hyperChaos
                ? "text-[#ff00ff] rgb-text font-bold"
                : chaosMode
                ? "text-[#00ffff]"
                : "text-zinc-500"
            }`}
          >
            {hyperChaos
              ? "!! HYPER QWUNK — REALITY COMPROMISED !!"
              : chaosMode
              ? "!! QWUNK CHAOS MODE ACTIVATED !!"
              : "the machine is listening"}
          </p>
        </div>

        {/* WARNING TICKER */}
        <div className="w-full border-y border-[#ff00ff22] py-2 overflow-hidden">
          <p
            className={`text-xs tracking-[0.5em] uppercase animate-[drift_4s_ease-in-out_infinite] ${
              chaosMode
                ? "text-[#ff00ff] opacity-80 tear-effect"
                : "text-[#ff00ff] opacity-40"
            }`}
          >
            ⚠ {warning} ⚠
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {[
            { val: "10B+", label: "qwunks processed" },
            { val: "∞", label: "qwunk capacity" },
            { val: "0", label: "qwunks refunded" },
            {
              val: String(qwunkCount),
              label: hyperChaos
                ? "qwunks (too many)"
                : chaosMode
                ? "your qwunks (WARNING)"
                : "your qwunks",
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className="qwunk-card rounded-lg p-4 bg-black/40"
              style={
                hyperChaos
                  ? {
                      animation: `warp-pulse ${2 + i * 0.5}s ease-in-out infinite`,
                    }
                  : undefined
              }
            >
              <div
                className={`text-2xl font-bold ${
                  hyperChaos
                    ? "text-[#ff00ff] rgb-text"
                    : "text-[#00ffff]"
                }`}
              >
                {s.val}
              </div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* THE BUTTON */}
        <button
          onClick={doTheQwunk}
          disabled={isQwunking}
          className={`
            relative px-12 py-5 rounded-md text-xl font-bold uppercase tracking-wider
            border-2 transition-all duration-300 cursor-pointer
            ${
              hyperChaos
                ? "border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black qwunk-button-chaos glitch-text"
                : chaosMode
                ? "border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black qwunk-button-chaos"
                : "border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black qwunk-button"
            }
            active:scale-90 disabled:opacity-40 disabled:cursor-wait
          `}
        >
          {isQwunking
            ? "[ QWUNKING... ]"
            : hyperChaos
            ? "!! QWUNK BEYOND !!"
            : chaosMode
            ? "!! QWUNK HARDER !!"
            : "[ GET QWUNKED ]"}
        </button>

        {/* TERMINAL OUTPUT */}
        {qwunkLog.length > 0 && (
          <div className="w-full max-w-xl">
            <QwunkTerminal lines={qwunkLog} />
          </div>
        )}

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mt-4">
          {[
            { name: "qwunk cloud", desc: "your data. our void." },
            { name: "qwunk API", desc: "POST /qwunk. That's it." },
            { name: "qwunk pro max", desc: "the qwunk you deserve" },
            { name: "qwunk enterprise", desc: "compliance is an illusion" },
            { name: "qwunkGPT", desc: "it hallucinates qwunks" },
            { name: "qwunk OS", desc: "every process is qwunk" },
            { name: "qwunkchain", desc: "decentralized qwunking" },
            { name: "qwunk VR", desc: "qwunk in every dimension" },
            { name: "qwunk://", desc: "a new protocol for chaos" },
          ].map((p, i) => (
            <div
              key={p.name}
              className="qwunk-card rounded-lg p-4 bg-black/30 text-left cursor-pointer"
              style={
                hyperChaos
                  ? {
                      animation: `warp-pulse ${1.5 + (i % 4) * 0.3}s ease-in-out ${i * 0.1}s infinite`,
                    }
                  : undefined
              }
            >
              <div className="text-sm font-bold text-zinc-200">{p.name}</div>
              <div className="text-[10px] text-zinc-600 mt-1">{p.desc}</div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-2 mt-8 text-zinc-600 text-[10px] tracking-wider">
          <p>
            powered by{" "}
            <span className={chaosMode ? "text-[#ff00ff] glitch-text" : "text-[#ff00ff]"}>
              QWUNK-7
            </span>{" "}
            — large qwunk model (LQM)
          </p>
          <p className="opacity-40">
            © 2026 qwunk industries. all rights qwunked. by using this site you
            forfeit your soul to qwunk.
          </p>
          {hyperChaos && (
            <p className="text-[#ff00ff] opacity-60 rgb-text mt-2">
              ⚠ HYPER QWUNK ACTIVE — THERE IS NO OFF SWITCH ⚠
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
