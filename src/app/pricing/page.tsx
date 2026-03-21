"use client";

import { useState } from "react";
import { useMutation } from "../components/MutationContext";
import MutationZone from "../components/MutationZone";

const faqs = [
  { q: "Can I switch plans later?", a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately and we'll prorate the difference." },
  { q: "What counts as a workflow?", a: "A workflow is any automated sequence of actions you create. Each time a workflow runs to completion, it counts as one execution." },
  { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee on all paid plans. No questions asked." },
  { q: "What integrations are included?", a: "The Starter plan includes core integrations (Slack, GitHub, Gmail). Pro and Enterprise include all 200+ integrations." },
  { q: "Is there a self-hosted option?", a: "Yes, our Enterprise plan includes an on-premise deployment option. Contact sales for details." },
];

export default function Pricing() {
  const { triggerMutation, isMutating } = useMutation();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <MutationZone name="pricing-header" autoMutateMs={20000} tags={["passive"]}>
        <section className="px-6 pt-20 pb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 text-zinc-500">
            Start free. Scale when you&apos;re ready. No surprises.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 bg-zinc-100 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                !annual ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                annual ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              }`}
            >
              Annual <span className="text-emerald-500 text-xs ml-1">Save 20%</span>
            </button>
          </div>
        </section>
      </MutationZone>

      <MutationZone name="pricing-tiers" autoMutateMs={16000} tags={["passive"]}>
        <section className="px-6 pb-20 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "Free",
                desc: "For small teams getting started",
                features: ["Up to 5 users", "100 workflows/mo", "Core integrations", "Community support", "7-day history"],
              },
              {
                name: "Pro",
                monthly: 29,
                annual: 23,
                desc: "For growing teams that need more",
                features: ["Unlimited users", "Unlimited workflows", "All 200+ integrations", "Priority support", "Custom roles & permissions", "90-day history", "API access"],
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                desc: "For organizations at scale",
                features: ["Everything in Pro", "SSO & SAML", "Dedicated account manager", "SLA guarantees", "On-premise option", "Unlimited history", "Custom integrations"],
              },
            ].map((tier) => {
              const displayPrice =
                tier.price ||
                `$${annual ? tier.annual : tier.monthly}`;
              const period =
                tier.price ? null : annual ? "/mo, billed annually" : "/mo";

              return (
                <div
                  key={tier.name}
                  className={`rounded-xl p-6 flex flex-col ${
                    tier.highlight
                      ? "bg-zinc-900 text-white border-2 border-zinc-900 ring-4 ring-zinc-900/5"
                      : "bg-white border border-zinc-200"
                  }`}
                >
                  <h3 className={`font-semibold text-lg ${tier.highlight ? "text-white" : "text-zinc-900"}`}>
                    {tier.name}
                  </h3>
                  <div className="mt-3">
                    <span className={`text-4xl font-bold ${tier.highlight ? "text-white" : "text-zinc-900"}`}>
                      {displayPrice}
                    </span>
                    {period && (
                      <span className={`text-sm ml-1 ${tier.highlight ? "text-zinc-400" : "text-zinc-500"}`}>
                        {period}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${tier.highlight ? "text-zinc-400" : "text-zinc-500"}`}>
                    {tier.desc}
                  </p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className={`text-sm flex items-start gap-2 ${
                          tier.highlight ? "text-zinc-300" : "text-zinc-600"
                        }`}
                      >
                        <span className={`mt-0.5 ${tier.highlight ? "text-emerald-400" : "text-emerald-500"}`}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => triggerMutation()}
                    disabled={isMutating}
                    className={`mt-6 w-full py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 ${
                      tier.highlight
                        ? "bg-white text-zinc-900 hover:bg-zinc-100"
                        : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                  >
                    {tier.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </MutationZone>

      <MutationZone name="pricing-faq" autoMutateMs={18000} tags={["passive"]}>
        <section className="bg-zinc-50 px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 text-center mb-8">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-zinc-100 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                  >
                    <span className="text-sm font-medium text-zinc-900">{faq.q}</span>
                    <span className="text-zinc-400 text-lg ml-4">
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-zinc-500 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </MutationZone>
    </>
  );
}
