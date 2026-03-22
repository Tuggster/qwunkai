"use client";

import { useEffect } from "react";
import { MutationProvider, useMutation } from "./MutationContext";
import MutationZone from "./MutationZone";
import Nav from "./Nav";
import FloatingTrigger from "./FloatingTrigger";
import CorruptionEngine from "./CorruptionEngine";
import Creatures from "./Creatures";
// CursorCorruption removed — permanent trails were filling the screen
import TabInfection from "./TabInfection";
import SoundEngine from "./SoundEngine";
import KeyboardQwunk from "./KeyboardQwunk";
import QwunkNotifications from "./QwunkNotifications";
import UserInputLore from "./UserInputLore";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { lore, phase, startPassiveQwunk, passiveActive, corruption } =
    useMutation();

  // Pre-load Three.js
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !(window as /* eslint-disable-line @typescript-eslint/no-explicit-any */ any).THREE
    ) {
      import("three").then((THREE) => {
        (window as /* eslint-disable-line @typescript-eslint/no-explicit-any */ any).THREE = THREE;
      });
    }
  }, []);

  // Start LLM mutations at corruption 15
  useEffect(() => {
    if (corruption >= 15 && !passiveActive) {
      startPassiveQwunk();
    }
  }, [corruption, passiveActive, startPassiveQwunk]);

  return (
    <>
      {/* ═══ CSS corruption engine ═══ */}
      <CorruptionEngine />

      {/* ═══ Root mutation zone (LLM takes this over) ═══ */}
      <MutationZone isRoot>
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1">{children}</main>
        </div>
      </MutationZone>

      {/* ═══ EVERYTHING BELOW IS OUTSIDE ROOT — persists through takeover ═══ */}

      <FloatingTrigger />

      {/* ── Sensory layers (all outside root zone) ── */}
      <Creatures />
      {/* CursorCorruption removed */}
      <TabInfection />
      <SoundEngine />
      <KeyboardQwunk />
      <QwunkNotifications />
      <UserInputLore />

      {/* ── Overlay mutation zones with custom directives ── */}

      {/* Background: full-viewport canvas art */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <MutationZone
          name="overlay-bg"
          autoMutateMs={10000}
          tags={["passive", "overlay"]}
          directive="Create a full-viewport background using <canvas> or CSS gradients. Use requestAnimationFrame for animation. Ideas: slow-moving noise, breathing gradient, subtle particle field, rippling water, starfield, aurora borealis, fog. Keep it atmospheric, not overwhelming. It sits BEHIND all content. Use varied, interesting color palettes — not just dark+neon. IMPORTANT: keep it subtle enough that overlaid text remains readable."
        >
          <div />
        </MutationZone>
      </div>

      {/* Top banner: cryptic messages, warnings, tickers */}
      {corruption >= 25 && (
        <div className="fixed top-0 left-0 right-0 z-[9980] pointer-events-none">
          <MutationZone
            name="overlay-banner"
            autoMutateMs={12000}
            tags={["passive", "overlay"]}
            directive="Create a thin banner/ticker at the top of the screen. It should contain cryptic scrolling text, warnings, fake system messages, or lore entity transmissions. Use <marquee> or CSS animation for scrolling. Keep it a single strip, not a full page. Make the text increasingly unhinged each mutation. Include references to lore entities and events. Can use unusual typography."
          >
            <div />
          </MutationZone>
        </div>
      )}

      {/* Corner widget: a persistent weird little thing */}
      {corruption >= 30 && (
        <div className="fixed bottom-20 left-4 z-[9985] pointer-events-auto" style={{ width: "200px", height: "160px" }}>
          <MutationZone
            name="overlay-widget"
            autoMutateMs={14000}
            tags={["passive", "overlay"]}
            directive="Create a small widget (200x160px) that lives in the bottom-left corner. Ideas: a tiny fake chat window with a lore entity, a mini radar/scanner, a pet creature with idle animation, a broken clock, a tiny TV showing static, a minimap of 'the qwunk', a small canvas with a shader effect, a fake notification stack. It should be interactive — clickable, hoverable, or animated. Give it personality."
          >
            <div />
          </MutationZone>
        </div>
      )}

      {/* Side crawl: vertical text/elements on the edge */}
      {corruption >= 35 && (
        <div className="fixed top-0 right-0 bottom-0 z-[9982] pointer-events-none" style={{ width: "60px" }}>
          <MutationZone
            name="overlay-side"
            autoMutateMs={16000}
            tags={["passive", "overlay"]}
            directive="Create a narrow vertical strip (60px wide) on the right edge of the screen. Ideas: vertical scrolling text (lore entries, warnings, code), a thin canvas with a waveform or EKG-like line, vertical progress bars that fill wrong, temperature/pressure gauges, a filmstrip effect, corrupted timestamps. Use writing-mode:vertical-rl for vertical text. Keep it narrow and edge-like."
          >
            <div />
          </MutationZone>
        </div>
      )}

      {/* Floating popup: random positioned chaotic element */}
      {corruption >= 45 && (
        <div
          className="fixed z-[9984] pointer-events-auto"
          style={{
            top: `${20 + Math.sin(corruption * 0.1) * 30}%`,
            left: `${10 + Math.cos(corruption * 0.15) * 20}%`,
            width: "280px",
            maxHeight: "220px",
            overflow: "hidden",
          }}
        >
          <MutationZone
            name="overlay-popup"
            autoMutateMs={11000}
            tags={["passive", "overlay"]}
            directive="Create a floating popup/window (280px wide). It should look like a draggable OS window, a notification, a dialog box, or an alert — but WRONG. Ideas: a fake error dialog with absurd buttons, a 'terms of service' for the qwunk, a popup ad for impossible products, a 'your computer has been qwunked' warning, a mini file browser, a chat window where an entity is typing. Include a fake title bar. Make buttons clickable (they should do funny DOM things when clicked via inline JS). Give it a drop shadow."
          >
            <div />
          </MutationZone>
        </div>
      )}

      {/* Second floating popup at higher corruption */}
      {corruption >= 60 && (
        <div
          className="fixed z-[9983] pointer-events-auto"
          style={{
            bottom: `${15 + Math.cos(corruption * 0.12) * 20}%`,
            right: `${8 + Math.sin(corruption * 0.08) * 15}%`,
            width: "240px",
            maxHeight: "200px",
            overflow: "hidden",
          }}
        >
          <MutationZone
            name="overlay-popup-2"
            autoMutateMs={13000}
            tags={["passive", "overlay"]}
            directive="Create a second floating popup, different from the first. Ideas: a fake system monitor showing impossible metrics, a 'downloading qwunk' progress bar that goes backwards or past 100%, a tiny canvas game, a fake webcam feed showing static or a lore entity, a music player for songs that don't exist. Make it feel like a DIFFERENT application than the other popup. Include interactivity."
          >
            <div />
          </MutationZone>
        </div>
      )}

      {/* Full-screen overlay: REMOVED — kept generating opaque black backgrounds */}

      {/* Lore ticker */}
      {lore && phase !== "qwunk" && (
        <div className="fixed bottom-0 left-0 right-0 z-[9991] pointer-events-none">
          <MutationZone
            name="lore-ticker"
            autoMutateMs={18000}
            tags={["passive"]}
            directive="Create a bottom status bar showing the current lore state. Include epoch number, era name, system status, and recent events as scrolling text. Make it look like a news ticker, system status bar, or monitoring dashboard strip. Style should match the current corruption level — clean early, progressively more broken."
          >
            <div className="pointer-events-auto bg-white/80 backdrop-blur-sm border-t border-zinc-200 px-4 py-2 font-mono text-[10px] text-zinc-400 flex items-center gap-4 overflow-hidden">
              <span className="text-zinc-300 shrink-0">
                epoch {lore.epoch}
              </span>
              <span className="shrink-0">{lore.era_name}</span>
              <span className="text-zinc-300">|</span>
              <span className="truncate">
                {(lore.recent_events || []).join(" · ")}
              </span>
              <span className="text-zinc-300 ml-auto shrink-0">
                sys: {lore.system_status}
              </span>
            </div>
          </MutationZone>
        </div>
      )}
    </>
  );
}

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MutationProvider>
      <ShellInner>{children}</ShellInner>
    </MutationProvider>
  );
}
