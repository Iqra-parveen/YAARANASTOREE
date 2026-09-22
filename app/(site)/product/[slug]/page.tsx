import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductDetailClient from "./ProductDetailClient";
import ProductReviews, { type ReviewItem } from "@/components/ProductReviews";
import RelatedProducts from "@/components/RelatedProducts";
import type { Product, ProductVariant, ProductImage, SizeGuide } from "@/lib/types";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, image_url")
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (!product) return { title: "Product Not Found" };

  const desc =
    product.description ||
    `Shop ${product.name} at YAARANA. Premium streetwear cut with heavyweight fabric and everyday luxury.`;

  return {
    title: product.name,
    description: desc,
    openGraph: {
      title: `${product.name} — YAARANA`,
      description: desc,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — YAARANA`,
      description: desc,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (!product) notFound();

  const [
    { data: variants },
    { data: images },
    { data: sizeGuide },
    { data: categoryRelated },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("product_variants").select("*").eq("product_id", product.id).eq("status", "active"),
    supabase.from("product_images").select("*").eq("product_id", product.id).order("display_order"),
    product.category_id
      ? supabase.from("size_guides").select("*").eq("category_id", product.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    product.category_id
      ? supabase
          .from("products")
          .select("*, categories(name, slug)")
          .eq("category_id", product.category_id)
          .eq("status", "active")
          .neq("id", product.id)
          .limit(4)
      : Promise.resolve({ data: [] }),
    supabase
      .from("reviews")
      .select("id, rating, title, body, created_at, profiles(full_name)")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false }),
  ]);

  // If fewer than 4 related items in the same category, fill with other active products
  let relatedProducts = (categoryRelated as Product[]) ?? [];
  if (relatedProducts.length < 4) {
    const { data: generalFallback } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("status", "active")
      .neq("id", product.id)
      .limit(4 - relatedProducts.length);

    if (generalFallback) {
      const existingIds = new Set(relatedProducts.map((p) => p.id));
      const addOns = (generalFallback as Product[]).filter((p) => !existingIds.has(p.id));
      relatedProducts = [...relatedProducts, ...addOns];
    }
  }

  return (
    <div>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-ink/95 px-4 py-3 backdrop-blur">
        <Link href="/shop" className="focus-gold text-bone/80 hover:text-bone" aria-label="Back">
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

      <ProductReviews
        productId={product.id}
        initialReviews={(reviews as unknown as ReviewItem[]) ?? []}
      />

      <RelatedProducts products={relatedProducts} />
    </div>
  );
}