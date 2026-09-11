import { createClient } from "@/lib/supabase/server";
import ProductForm from "../ProductForm";
import type { Category } from "@/lib/types";

export default async function NewProductPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Add Product</h1>
      <ProductForm categories={(categories as Category[]) ?? []} />
    </div>
  );
}
