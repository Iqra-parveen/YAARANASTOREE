import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProductDetailClient from "./ProductDetailClient";
import type { Product, ProductVariant, ProductImage, SizeGuide } from "@/lib/types";

export const revalidate = 0;

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (!product) notFound();

  const [{ data: variants }, { data: images }, { data: sizeGuide }] = await Promise.all([
    supabase.from("product_variants").select("*").eq("product_id", product.id).eq("status", "active"),
    supabase.from("product_images").select("*").eq("product_id", product.id).order("display_order"),
    product.category_id
      ? supabase.from("size_guides").select("*").eq("category_id", product.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur">
        <Link href="/shop" className="focus-gold text-bone/80" aria-label="Back">
          <ChevronLeft size={20} />
        </Link>
        <span className="truncate text-sm text-bone/80">{product.name}</span>
      </header>
      <ProductDetailClient
        product={product as Product}
        variants={(variants as ProductVariant[]) ?? []}
        images={(images as ProductImage[]) ?? []}
        sizeGuide={(sizeGuide as SizeGuide | null) ?? null}
      />
    </div>
  );
}