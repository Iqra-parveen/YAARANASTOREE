import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductForm from "../../ProductForm";
import VariantManager from "./VariantManager";
import GalleryManager from "./GalleryManager";
import type { Category, Product, ProductVariant, ProductImage } from "@/lib/types";

export const revalidate = 0;

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: product }, { data: categories }, { data: variants }, { data: images }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).single(),
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("product_variants").select("*").eq("product_id", params.id).order("created_at"),
    supabase.from("product_images").select("*").eq("product_id", params.id).order("display_order"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Edit Product</h1>
      <ProductForm categories={(categories as Category[]) ?? []} product={product as Product} />
      <VariantManager productId={product.id} variants={(variants as ProductVariant[]) ?? []} />
      <GalleryManager productId={product.id} images={(images as ProductImage[]) ?? []} />
    </div>
  );
}