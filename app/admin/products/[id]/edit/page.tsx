import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductForm from "../../ProductForm";
import type { Category, Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).single(),
    supabase.from("categories").select("*").order("display_order"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Edit Product</h1>
      <ProductForm categories={(categories as Category[]) ?? []} product={product as Product} />
    </div>
  );
}
