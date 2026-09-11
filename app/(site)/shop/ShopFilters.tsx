"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export default function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("category", slug);
    else params.delete("category");
    router.push(`/shop?${params.toString()}`);
  }

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q") as string;
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <div>
      <form onSubmit={onSearch} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone/40" />
        <input
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Search products"
          className="focus-gold w-full rounded-sm border border-hairline bg-charcoal py-2.5 pl-9 pr-3 text-sm text-bone placeholder:text-bone/40"
        />
      </form>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategory(null)}
          className={cn(
            "focus-gold shrink-0 rounded-full border px-3 py-1.5 text-xs",
            !activeCategory ? "border-gold text-gold" : "border-hairline text-bone/60"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={cn(
              "focus-gold shrink-0 rounded-full border px-3 py-1.5 text-xs",
              activeCategory === c.slug ? "border-gold text-gold" : "border-hairline text-bone/60"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
