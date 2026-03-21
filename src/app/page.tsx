"use client";

import { useMutation } from "./components/MutationContext";
import MutationZone from "./components/MutationZone";

export default function Home() {
  const { triggerMutation, isMutating } = useMutation();

  return (
    <>
      {/* HERO */}
      <MutationZone name="hero" autoMutateMs={20000} tags={["passive"]}>
        <section className="flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Now in public beta
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
            Automate your workflows
            <br />
            with AI that gets it
          </h1>
          <p className="mt-6 text-lg text-zinc-500 max-w-xl leading-relaxed">
            Qwunk connects your tools, understands your processes, and handles
            the busywork so your team can focus on what matters.
          </p>
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => triggerMutation()}
              disabled={isMutating}
              className="bg-zinc-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isMutating ? "Processing..." : "Start Free Trial"}
            </button>
            <span className="border border-zinc-200 text-zinc-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors cursor-pointer">
              Watch Demo
            </span>
          </div>
          <p className="mt-4 text-xs text-zinc-400">
            No credit card required · Free for up to 5 users
          </p>
        </section>
      </MutationZone>

      {/* SOCIAL PROOF */}
      <MutationZone name="social-proof" autoMutateMs={15000} tags={["passive"]}>
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

      {/* FEATURES */}
      <MutationZone name="features" autoMutateMs={18000} tags={["passive"]}>
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
              { title: "Smart Routing", desc: "AI analyzes incoming requests and routes them to the right team member automatically.", icon: "→" },
              { title: "Workflow Builder", desc: "Visual drag-and-drop builder to create custom automations without writing code.", icon: "◇" },
              { title: "Real-time Analytics", desc: "Track performance metrics and identify bottlenecks across your entire pipeline.", icon: "◈" },
              { title: "Integrations", desc: "Connect with Slack, GitHub, Linear, Notion, and 200+ other tools out of the box.", icon: "⬡" },
              { title: "Team Permissions", desc: "Granular role-based access control to keep your workflows secure and organized.", icon: "◎" },
              { title: "API Access", desc: "Full REST API with webhooks for building custom integrations and extensions.", icon: "⟐" },
            ].map((f) => (
              <div key={f.title} className="border border-zinc-100 rounded-xl p-6 hover:border-zinc-200 hover:shadow-sm transition-all">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-zinc-900 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </MutationZone>

      {/* HOW IT WORKS */}
      <MutationZone name="how-it-works" autoMutateMs={22000} tags={["passive"]}>
        <section className="bg-zinc-50 px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 text-center mb-12">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Connect your tools", desc: "Link your existing stack in minutes. We support 200+ integrations with one-click setup." },
                { step: "2", title: "Define your workflows", desc: "Use our visual builder or describe what you need in plain English. The AI handles the rest." },
                { step: "3", title: "Watch it work", desc: "Qwunk runs your workflows 24/7, learning and optimizing as it goes. You focus on building." },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </MutationZone>

      {/* STATS */}
      <MutationZone name="stats" autoMutateMs={16000} tags={["passive"]}>
        <section className="px-6 py-16">
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

      {/* TESTIMONIALS */}
      <MutationZone name="testimonials" autoMutateMs={20000} tags={["passive"]}>
        <section className="bg-zinc-50 px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 text-center mb-12">
              Loved by teams everywhere
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { quote: "Qwunk replaced three internal tools for us. Our team saves about 15 hours a week on manual routing alone.", name: "Sarah Chen", role: "VP Engineering, Acme Corp" },
                { quote: "The workflow builder is incredibly intuitive. We had our first automation running in under 10 minutes.", name: "Marcus Rivera", role: "Head of Ops, Globex" },
                { quote: "Best developer experience I've seen in an automation tool. The API is clean and the docs are fantastic.", name: "Priya Sharma", role: "Staff Engineer, Initech" },
              ].map((t) => (
                <div key={t.name} className="bg-white rounded-xl p-6 border border-zinc-100">
                  <p className="text-sm text-zinc-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">{t.name}</p>
                    <p className="text-xs text-zinc-400">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </MutationZone>

      {/* CTA */}
      <MutationZone name="cta" autoMutateMs={25000} tags={["passive"]}>
        <section className="px-6 py-20 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Ready to automate?
          </h2>
          <p className="mt-3 text-zinc-500">
            Join 10,000+ teams already using Qwunk to streamline their work.
          </p>
          <button
            onClick={() => triggerMutation()}
            disabled={isMutating}
            className="mt-8 bg-zinc-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isMutating ? "Processing..." : "Get Started for Free"}
          </button>
        </section>
      </MutationZone>

      {/* FOOTER */}
      <MutationZone name="footer" autoMutateMs={14000} tags={["passive"]}>
        <footer className="border-t border-zinc-100 px-6 py-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-zinc-400">© 2026 Qwunk, Inc. All rights reserved.</span>
            <div className="flex gap-6 text-sm text-zinc-400">
              <span className="hover:text-zinc-600 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-zinc-600 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-zinc-600 cursor-pointer transition-colors">Security</span>
              <span className="hover:text-zinc-600 cursor-pointer transition-colors">Status</span>
            </div>
          </div>
        </footer>
      </MutationZone>
    </>
  );
}
