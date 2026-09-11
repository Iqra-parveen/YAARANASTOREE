import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import ProductCard from "@/components/ProductCard";
import CategoryPill from "@/components/CategoryPill";
import HeroSlideshow from "@/components/HeroSlideshow";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import type { Category, Product, Banner } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: categories }, { data: featured }, { data: banners }] = await Promise.all([
    supabase.from("categories").select("*").eq("status", "active").order("display_order"),
    supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("status", "active")
      .eq("featured", true)
      .limit(8),
    supabase.from("banners").select("*").eq("status", "active").order("display_order"),
  ]);

  return (
    <div>
      <TopBar />

      <section className="px-4 pt-4">
        <Reveal>
          <HeroSlideshow banners={(banners as Banner[]) ?? []} />
        </Reveal>
      </section>

      <section className="px-4 pt-6">
        <Reveal delay={0.05}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm tracking-wide text-bone/70">Shop by category</h2>
          </div>
          {(() => {
            const cats = (categories as Category[] | null) ?? [];
            // Below this count, circles are spaced to fill the row evenly instead
            // of leaving empty space at the end. Above it, switch to a scrollable
            // row (scrollbar hidden, but still swipeable/draggable).
            const FILL_THRESHOLD = 5;
            const fillsRow = cats.length > 0 && cats.length <= FILL_THRESHOLD;

            return (
              <div
                className={
                  fillsRow
                    ? "grid"
                    : "flex gap-4 overflow-x-auto no-scrollbar pb-1"
                }
                style={fillsRow ? { gridTemplateColumns: `repeat(${cats.length}, minmax(0, 1fr))` } : undefined}
              >
                {cats.map((c) => (
                  <CategoryPill key={c.id} category={c} />
                ))}
                {cats.length === 0 && (
                  <p className="text-xs text-bone/40">Categories will appear here once added.</p>
                )}
              </div>
            );
          })()}
        </Reveal>
      </section>

      <section className="px-4 pt-8">
        <Reveal>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm tracking-wide text-bone/70">Featured</h2>
            <Link href="/shop" className="text-xs text-gold">
              View all
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-4">
          {(featured as Product[] | null)?.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <ProductCard product={p} />
            </Reveal>
          ))}
          {(!featured || featured.length === 0) && (
            <p className="col-span-2 text-xs text-bone/40">
              Featured products will appear here once the admin marks some as featured.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}