"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface ShopFiltersProps {
  categories: Category[];
  availableSizes?: string[];
  availableColors?: string[];
  priceBounds?: { min: number; max: number };
}

export default function ShopFilters({
  categories,
  availableSizes = ["XS", "S", "M", "L", "XL", "XXL"],
  availableColors = [],
  priceBounds = { min: 0, max: 50000 },
}: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);

  // Read current URL params
  const activeCategory = searchParams.get("category");
  const activeQ = searchParams.get("q") ?? "";
  const activeMinPrice = searchParams.get("minPrice") ?? "";
  const activeMaxPrice = searchParams.get("maxPrice") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  const selectedSizes = searchParams.get("size")
    ? searchParams.get("size")!.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const selectedColors = searchParams.get("color")
    ? searchParams.get("color")!.split(",").map((c) => c.trim()).filter(Boolean)
    : [];

  // Local state for price inputs inside drawer
  const [minPriceInput, setMinPriceInput] = useState(activeMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(activeMaxPrice);

  function updateParams(updater: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    router.push(`/shop?${params.toString()}`);
  }

  function setCategory(slug: string | null) {
    updateParams((params) => {
      if (slug) params.set("category", slug);
      else params.delete("category");
    });
  }

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q") as string;
    updateParams((params) => {
      if (q && q.trim()) params.set("q", q.trim());
      else params.delete("q");
    });
  }

  function clearSearch() {
    updateParams((params) => {
      params.delete("q");
    });
  }

  function toggleSize(size: string) {
    updateParams((params) => {
      let next: string[];
      if (selectedSizes.includes(size)) {
        next = selectedSizes.filter((s) => s !== size);
      } else {
        next = [...selectedSizes, size];
      }
      if (next.length > 0) params.set("size", next.join(","));
      else params.delete("size");
    });
  }

  function toggleColor(color: string) {
    updateParams((params) => {
      let next: string[];
      if (selectedColors.some((c) => c.toLowerCase() === color.toLowerCase())) {
        next = selectedColors.filter((c) => c.toLowerCase() !== color.toLowerCase());
      } else {
        next = [...selectedColors, color];
      }
      if (next.length > 0) params.set("color", next.join(","));
      else params.delete("color");
    });
  }

  function applyPrice() {
    updateParams((params) => {
      if (minPriceInput.trim()) params.set("minPrice", minPriceInput.trim());
      else params.delete("minPrice");

      if (maxPriceInput.trim()) params.set("maxPrice", maxPriceInput.trim());
      else params.delete("maxPrice");
    });
  }

  function clearPrice() {
    setMinPriceInput("");
    setMaxPriceInput("");
    updateParams((params) => {
      params.delete("minPrice");
      params.delete("maxPrice");
    });
  }

  function setSort(sortValue: string) {
    updateParams((params) => {
      if (sortValue && sortValue !== "newest") params.set("sort", sortValue);
      else params.delete("sort");
    });
  }

  function clearAllFilters() {
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push("/shop");
  }

  // Count active criteria
  const filterCount =
    (activeCategory ? 1 : 0) +
    (activeQ ? 1 : 0) +
    (activeMinPrice || activeMaxPrice ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length;

  const hasAnyFilter = filterCount > 0 || activeSort !== "newest";

  return (
    <div className="flex flex-col gap-3">
      {/* Search Input */}
      <form onSubmit={onSearch} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone/40" />
        <input
          name="q"
          key={activeQ}
          defaultValue={activeQ}
          placeholder="Search products"
          className="focus-gold w-full rounded-sm border border-hairline bg-charcoal py-2.5 pl-9 pr-9 text-sm text-bone placeholder:text-bone/40"
        />
        {activeQ && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bone/40 hover:text-bone"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </form>

      {/* Category Pills Bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setCategory(null)}
          className={cn(
            "focus-gold shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
            !activeCategory
              ? "border-gold bg-gold/10 text-gold font-medium"
              : "border-hairline text-bone/60 hover:text-bone"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={cn(
              "focus-gold shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors",
              activeCategory === c.slug
                ? "border-gold bg-gold/10 text-gold font-medium"
                : "border-hairline text-bone/60 hover:text-bone"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Filter Trigger & Sort Bar */}
      <div className="flex items-center justify-between border-t border-hairline pt-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              "focus-gold inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs transition-colors",
              isOpen || filterCount > 0
                ? "border-gold bg-gold/10 text-gold font-medium"
                : "border-hairline bg-charcoal text-bone/80 hover:text-bone"
            )}
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
            {filterCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-bone">
                {filterCount}
              </span>
            )}
          </button>

          {hasAnyFilter && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-bone/50 hover:text-rust underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1">
          <ArrowUpDown size={12} className="text-bone/40" />
          <select
            value={activeSort}
            onChange={(e) => setSort(e.target.value)}
            className="focus-gold rounded-sm border border-hairline bg-charcoal px-2 py-1 text-xs text-bone"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {filterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {activeCategory && (
            <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-charcoal px-2 py-0.5 text-[11px] text-bone/80">
              Category: {categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory}
              <button onClick={() => setCategory(null)} className="text-bone/50 hover:text-bone">
                <X size={11} />
              </button>
            </span>
          )}

          {activeQ && (
            <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-charcoal px-2 py-0.5 text-[11px] text-bone/80">
              "{activeQ}"
              <button onClick={clearSearch} className="text-bone/50 hover:text-bone">
                <X size={11} />
              </button>
            </span>
          )}

          {(activeMinPrice || activeMaxPrice) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-charcoal px-2 py-0.5 text-[11px] text-bone/80">
              PKR {activeMinPrice || "0"} - {activeMaxPrice || "Any"}
              <button onClick={clearPrice} className="text-bone/50 hover:text-bone">
                <X size={11} />
              </button>
            </span>
          )}

          {selectedSizes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-charcoal px-2 py-0.5 text-[11px] text-bone/80"
            >
              Size: {s}
              <button onClick={() => toggleSize(s)} className="text-bone/50 hover:text-bone">
                <X size={11} />
              </button>
            </span>
          ))}

          {selectedColors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full border border-hairline bg-charcoal px-2 py-0.5 text-[11px] text-bone/80 capitalize"
            >
              Color: {c}
              <button onClick={() => toggleColor(c)} className="text-bone/50 hover:text-bone">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Expandable Filter Panel */}
      {isOpen && (
        <div className="rounded-sm border border-hairline bg-charcoal/60 p-4 space-y-4 animate-fade-up">
          {/* Price Range Section */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-bone">Price (PKR)</span>
              {(activeMinPrice || activeMaxPrice) && (
                <button onClick={clearPrice} className="text-[11px] text-bone/50 hover:text-rust">
                  Reset price
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="focus-gold w-full rounded-sm border border-hairline bg-ink px-2.5 py-1.5 text-xs text-bone placeholder:text-bone/40"
              />
              <span className="text-xs text-bone/40">—</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="focus-gold w-full rounded-sm border border-hairline bg-ink px-2.5 py-1.5 text-xs text-bone placeholder:text-bone/40"
              />
              <button
                type="button"
                onClick={applyPrice}
                className="focus-gold shrink-0 rounded-sm bg-gold px-3 py-1.5 text-xs font-medium text-bone"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Sizes Section */}
          {availableSizes.length > 0 && (
            <div className="border-t border-hairline pt-3">
              <span className="text-xs font-medium text-bone">Sizes</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {availableSizes.map((s) => {
                  const isSelected = selectedSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={cn(
                        "focus-gold min-w-[36px] rounded-sm border px-2.5 py-1 text-xs transition-colors",
                        isSelected
                          ? "border-gold bg-gold/15 text-gold font-semibold shadow-sm"
                          : "border-hairline bg-ink text-bone/70 hover:text-bone hover:border-gold/40"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Colors Section */}
          {availableColors.length > 0 && (
            <div className="border-t border-hairline pt-3">
              <span className="text-xs font-medium text-bone">Colors</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {availableColors.map((c) => {
                  const isSelected = selectedColors.some((sc) => sc.toLowerCase() === c.toLowerCase());
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleColor(c)}
                      className={cn(
                        "focus-gold rounded-sm border px-2.5 py-1 text-xs capitalize transition-colors",
                        isSelected
                          ? "border-gold bg-gold/15 text-gold font-semibold shadow-sm"
                          : "border-hairline bg-ink text-bone/70 hover:text-bone hover:border-gold/40"
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Panel Footer */}
          <div className="flex justify-end border-t border-hairline pt-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="focus-gold text-xs text-bone/60 hover:text-bone"
            >
              Close filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
