import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import type { Category, Product } from "@/lib/types";
import ShopFilters from "./ShopFilters";

export const revalidate = 0;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "active")
    .order("display_order");

  let query = supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("status", "active");

  if (searchParams.category) {
    const cat = (categories as Category[] | null)?.find((c) => c.slug === searchParams.category);
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }

  const { data: products } = await query.order("created_at", { ascending: false });

  return (
    <div>
      <TopBar title="Shop" />
      <div className="px-4 pt-4">
        <ShopFilters categories={(categories as Category[]) ?? []} />
        <div className="mt-5 grid grid-cols-2 gap-4">
          {(products as Product[] | null)?.map((p, i) => (
            <Reveal key={p.id} delay={(i % 6) * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
          {(!products || products.length === 0) && (
            <p className="col-span-2 py-10 text-center text-xs text-bone/40">
              No products match yet. Try a different search or category.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
