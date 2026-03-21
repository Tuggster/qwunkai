"use client";

import { useState } from "react";
import { useMutation } from "../components/MutationContext";
import MutationZone from "../components/MutationZone";

const posts = [
  {
    title: "Introducing Qwunk 2.0: Smarter Workflows, Faster Everything",
    excerpt: "Today we're launching the biggest update to Qwunk since our public beta. New AI routing engine, redesigned builder, and 50+ new integrations.",
    date: "Mar 18, 2026",
    author: "Alex Kim",
    category: "Product",
    featured: true,
  },
  {
    title: "How We Reduced Workflow Latency by 73%",
    excerpt: "A deep dive into the infrastructure changes that made Qwunk dramatically faster for high-throughput teams.",
    date: "Mar 12, 2026",
    author: "Priya Sharma",
    category: "Engineering",
  },
  {
    title: "Building Automations That Actually Work: A Practical Guide",
    excerpt: "Lessons learned from helping 10,000+ teams build reliable workflows. Avoid the common pitfalls.",
    date: "Mar 5, 2026",
    author: "Marcus Rivera",
    category: "Guides",
  },
  {
    title: "Qwunk Raises $28M Series A to Expand AI Workflow Platform",
    excerpt: "We're excited to announce our Series A led by Meridian Ventures. Here's what we're building next.",
    date: "Feb 28, 2026",
    author: "Alex Kim",
    category: "Company",
  },
  {
    title: "The Future of Work is Automated (And That's a Good Thing)",
    excerpt: "Why we believe AI-powered automation will create more meaningful work, not less.",
    date: "Feb 20, 2026",
    author: "Sarah Chen",
    category: "Company",
  },
  {
    title: "Securing Your Workflows: Best Practices for Enterprise Teams",
    excerpt: "A comprehensive guide to API key management, role-based access, and audit logging in Qwunk.",
    date: "Feb 14, 2026",
    author: "James Park",
    category: "Engineering",
  },
];

const categories = ["All", "Product", "Engineering", "Guides", "Company"];

export default function Blog() {
  const { triggerMutation, isMutating } = useMutation();
  const [activeCategory, setActiveCategory] = useState("All");

  const featured = posts.find((p) => p.featured);
  const filtered = posts
    .filter((p) => !p.featured)
    .filter((p) => activeCategory === "All" || p.category === activeCategory);

  return (
    <>
      <MutationZone name="blog-header" autoMutateMs={22000} tags={["passive"]}>
        <section className="px-6 pt-16 pb-8 max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Blog</h1>
          <p className="mt-2 text-zinc-500">
            Product updates, engineering deep dives, and company news.
          </p>
        </section>
      </MutationZone>

      {featured && (
        <MutationZone name="blog-featured" autoMutateMs={18000} tags={["passive"]}>
          <section className="px-6 pb-12 max-w-5xl mx-auto">
            <div
              onClick={() => triggerMutation()}
              className="bg-zinc-50 rounded-2xl p-8 md:p-12 border border-zinc-100 hover:border-zinc-200 transition-colors cursor-pointer"
            >
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {featured.category}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mt-4 leading-tight">
                {featured.title}
              </h2>
              <p className="text-zinc-500 mt-3 max-w-2xl leading-relaxed">
                {featured.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-3 text-sm text-zinc-400">
                <span>{featured.author}</span>
                <span>·</span>
                <span>{featured.date}</span>
              </div>
            </div>
          </section>
        </MutationZone>
      )}

      <MutationZone name="blog-filters" autoMutateMs={25000} tags={["passive"]}>
        <section className="px-6 max-w-5xl mx-auto mb-8">
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      </MutationZone>

      <MutationZone name="blog-grid" autoMutateMs={16000} tags={["passive"]}>
        <section className="px-6 pb-20 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <article
                key={post.title}
                onClick={() => triggerMutation()}
                className="border border-zinc-100 rounded-xl p-6 hover:border-zinc-200 hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="text-xs font-medium text-zinc-400">
                  {post.category}
                </span>
                <h3 className="font-semibold text-zinc-900 mt-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </MutationZone>

      <MutationZone name="blog-newsletter" autoMutateMs={20000} tags={["passive"]}>
        <section className="bg-zinc-50 px-6 py-16">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-bold text-zinc-900">Stay in the loop</h3>
            <p className="text-sm text-zinc-500 mt-2">
              Get product updates and engineering insights delivered weekly.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="you@company.com"
                className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  triggerMutation();
                }}
                disabled={isMutating}
                className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </MutationZone>
    </>
  );
}
