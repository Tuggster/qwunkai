"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation } from "./MutationContext";
import MutationZone from "./MutationZone";

const links = [
  { href: "/", label: "Product" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const pathname = usePathname();
  const { triggerMutation, isMutating } = useMutation();

  return (
    <MutationZone name="nav">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
            Qwunk
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`transition-colors ${
                  pathname === l.href
                    ? "text-zinc-900 font-medium"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 hover:text-zinc-900 cursor-pointer transition-colors">
            Log in
          </span>
          <button
            onClick={() => triggerMutation()}
            disabled={isMutating}
            className="text-sm bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors disabled:opacity-50"
          >
            Get Started
          </button>
        </div>
      </nav>
    </MutationZone>
  );
}
