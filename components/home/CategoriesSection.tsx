"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import type { Category } from "@/lib/types";

export default function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="rounded-t-[40px] bg-charcoal px-5 py-16 sm:rounded-t-[50px]">
      <Reveal>
        <h2 className="text-gradient-onlight mb-10 text-center font-display text-[12vw] font-black uppercase leading-none tracking-tight sm:text-[9vw] md:text-6xl">
          Categories
        </h2>
      </Reveal>
      <div className="mx-auto flex max-w-xl flex-col divide-y divide-hairline">
        {categories.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.1}>
            <Link href={`/shop?category=${c.slug}`} className="focus-gold group flex items-center gap-4 py-6">
              <span className="font-display text-5xl font-black leading-none text-bone/10 transition-colors group-hover:text-gold/30 sm:text-6xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="block text-lg font-medium uppercase tracking-wide text-bone transition-colors group-hover:text-gold">
                  {c.name}
                </span>
                <span className="block text-sm text-bone/50">
                  {c.description || `Shop the ${c.name} collection.`}
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
        {categories.length === 0 && (
          <p className="py-6 text-center text-sm text-bone/40">Categories coming soon.</p>
        )}
      </div>
    </section>
  );
}