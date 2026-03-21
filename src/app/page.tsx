"use client";

import { useCallback } from "react";
import { MutationProvider, useMutation } from "./components/MutationContext";
import MutationZone from "./components/MutationZone";

function QwunkApp() {
  const {
    mutateRandom,
    mutateAll,
    isMutating,
    totalMutations,
    startPassiveQwunk,
    passiveActive,
    lore,
  } = useMutation();

  const handleClick = useCallback(() => {
    if (!passiveActive) {
      startPassiveQwunk();
    }
    if (totalMutations > 10) {
      mutateAll();
    } else {
      mutateRandom();
    }
  }, [passiveActive, startPassiveQwunk, totalMutations, mutateAll, mutateRandom]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ========== NAV ========== */}
      <MutationZone name="nav">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-8">
            <span className="text-lg font-semibold tracking-tight">Qwunk</span>
            <div className="hidden md:flex items-center gap-6 text-sm text-zinc-500">
              <span className="hover:text-zinc-900 cursor-pointer transition-colors">Product</span>
              <span className="hover:text-zinc-900 cursor-pointer transition-colors">Pricing</span>
              <span className="hover:text-zinc-900 cursor-pointer transition-colors">Docs</span>
              <span className="hover:text-zinc-900 cursor-pointer transition-colors">Blog</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">Log in</span>
            <span className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors">
              Get Started
            </span>
          </div>
        </nav>
      </MutationZone>

      {/* ========== HERO ========== */}
      <MutationZone name="hero">
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            Now in public beta
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
            Automate your workflows<br />with AI that gets it
          </h1>
          <p className="mt-6 text-lg text-zinc-500 max-w-xl leading-relaxed">
            Qwunk connects your tools, understands your processes, and handles
            the busywork so your team can focus on what matters.
          </p>
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleClick}
              disabled={isMutating}
              className="bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isMutating ? "Processing..." : "Start Free Trial"}
            </button>
            <span className="border border-zinc-200 text-zinc-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors cursor-pointer">
              Book a Demo
            </span>
          </div>
          <p className="mt-4 text-xs text-zinc-400">No credit card required · Free for up to 5 users</p>
        </section>
      </MutationZone>

      {/* ========== SOCIAL PROOF ========== */}
      <MutationZone name="social-proof" autoMutateMs={45000} tags={["passive"]}>
        <section className="border-y border-zinc-100 py-8 px-6">
          <p className="text-xs text-zinc-400 text-center uppercase tracking-wider mb-6">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 text-zinc-300 text-sm font-medium">
            <span>Acme Corp</span>
            <span>Globex</span>
            <span>Initech</span>
            <span>Hooli</span>
            <span>Piedmont</span>
            <span>Vandelay</span>
          </div>
        </section>
      </MutationZone>

      {/* ========== FEATURES ========== */}
      <MutationZone name="features" autoMutateMs={50000} tags={["passive"]}>
        <section className="px-6 py-20 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Everything you need to move faster
            </h2>
            <p className="mt-3 text-zinc-500 max-w-lg mx-auto">
              Powerful features designed to eliminate repetitive work and keep
              your team in flow.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Routing",
                desc: "AI analyzes incoming requests and routes them to the right team member automatically.",
                icon: "→",
              },
              {
                title: "Workflow Builder",
                desc: "Visual drag-and-drop builder to create custom automations without writing code.",
                icon: "◇",
              },
              {
                title: "Real-time Analytics",
                desc: "Track performance metrics and identify bottlenecks across your entire pipeline.",
                icon: "◈",
              },
              {
                title: "Integrations",
                desc: "Connect with Slack, GitHub, Linear, Notion, and 200+ other tools out of the box.",
                icon: "⬡",
              },
              {
                title: "Team Permissions",
                desc: "Granular role-based access control to keep your workflows secure and organized.",
                icon: "◎",
              },
              {
                title: "API Access",
                desc: "Full REST API with webhooks for building custom integrations and extensions.",
                icon: "⟐",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="border border-zinc-100 rounded-xl p-6 hover:border-zinc-200 hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-zinc-900 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </MutationZone>

      {/* ========== STATS ========== */}
      <MutationZone name="stats">
        <section className="bg-zinc-50 px-6 py-16">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "10,000+", label: "Teams" },
              { val: "2.4M", label: "Workflows Run" },
              { val: "99.99%", label: "Uptime" },
              { val: "4.9/5", label: "Customer Rating" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-zinc-900">{s.val}</div>
                <div className="text-sm text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </MutationZone>

      {/* ========== TESTIMONIAL ========== */}
      <MutationZone name="testimonial" autoMutateMs={55000} tags={["passive"]}>
        <section className="px-6 py-20 max-w-2xl mx-auto text-center">
          <blockquote className="text-xl text-zinc-700 leading-relaxed">
            &ldquo;Qwunk replaced three internal tools for us. Our team saves about 15
            hours a week on manual routing alone. It just works.&rdquo;
          </blockquote>
          <div className="mt-6">
            <p className="font-medium text-zinc-900">Sarah Chen</p>
            <p className="text-sm text-zinc-400">VP Engineering, Acme Corp</p>
          </div>
        </section>
      </MutationZone>

      {/* ========== PRICING ========== */}
      <MutationZone name="pricing" autoMutateMs={60000} tags={["passive"]}>
        <section className="bg-zinc-50 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-zinc-500">
              Start free. Scale when you&apos;re ready.
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "Free",
                desc: "For small teams getting started",
                features: [
                  "Up to 5 users",
                  "100 workflows/mo",
                  "Basic integrations",
                  "Community support",
                ],
              },
              {
                name: "Pro",
                price: "$29",
                desc: "For growing teams that need more",
                features: [
                  "Unlimited users",
                  "Unlimited workflows",
                  "All integrations",
                  "Priority support",
                  "Custom roles",
                ],
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "For organizations at scale",
                features: [
                  "Everything in Pro",
                  "SSO & SAML",
                  "Dedicated account manager",
                  "SLA guarantees",
                  "On-premise option",
                ],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-xl p-6 ${
                  p.highlight
                    ? "bg-zinc-900 text-white border-2 border-zinc-900"
                    : "bg-white border border-zinc-200"
                }`}
              >
                <h3
                  className={`font-semibold text-lg ${
                    p.highlight ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {p.name}
                </h3>
                <div className="mt-2">
                  <span
                    className={`text-3xl font-bold ${
                      p.highlight ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    {p.price}
                  </span>
                  {p.price !== "Free" && p.price !== "Custom" && (
                    <span
                      className={
                        p.highlight ? "text-zinc-400" : "text-zinc-500"
                      }
                    >
                      /mo
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mt-2 ${
                    p.highlight ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  {p.desc}
                </p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className={`text-sm flex items-center gap-2 ${
                        p.highlight ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    >
                      <span className={p.highlight ? "text-emerald-400" : "text-emerald-500"}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </MutationZone>

      {/* ========== CTA ========== */}
      <MutationZone name="cta">
        <section className="px-6 py-20 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Ready to automate?
          </h2>
          <p className="mt-3 text-zinc-500">
            Join 10,000+ teams already using Qwunk to streamline their work.
          </p>
          <button
            onClick={handleClick}
            disabled={isMutating}
            className="mt-8 bg-zinc-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isMutating ? "Processing..." : "Get Started for Free"}
          </button>
        </section>
      </MutationZone>

      {/* ========== FOOTER ========== */}
      <MutationZone name="footer" autoMutateMs={40000} tags={["passive"]}>
        <footer className="border-t border-zinc-100 px-6 py-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-zinc-400">
              © 2026 Qwunk, Inc. All rights reserved.
            </span>
            <div className="flex gap-6 text-sm text-zinc-400">
              <span className="hover:text-zinc-600 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-zinc-600 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-zinc-600 cursor-pointer transition-colors">Security</span>
              <span className="hover:text-zinc-600 cursor-pointer transition-colors">Status</span>
            </div>
          </div>
        </footer>
      </MutationZone>

      {/* ========== AMBIENT ZONES (start empty, mutations fill them) ========== */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <MutationZone name="ambient-bg" autoMutateMs={35000} tags={["passive", "ambient"]}>
          <div></div>
        </MutationZone>
      </div>

      {/* ========== LORE DISPLAY (appears once lore exists) ========== */}
      {lore && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <MutationZone name="lore-ticker" autoMutateMs={50000} tags={["passive"]}>
            <div className="pointer-events-auto bg-white/80 backdrop-blur-sm border-t border-zinc-200 px-4 py-2 font-mono text-[10px] text-zinc-400 flex items-center gap-4 overflow-hidden">
              <span className="text-zinc-300 shrink-0">epoch {lore.epoch}</span>
              <span className="shrink-0">{lore.era_name}</span>
              <span className="text-zinc-300">|</span>
              <span className="truncate">{(lore.recent_events || []).join(" · ")}</span>
              <span className="text-zinc-300 ml-auto shrink-0">sys: {lore.system_status}</span>
            </div>
          </MutationZone>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <MutationProvider>
      <QwunkApp />
    </MutationProvider>
  );
}
