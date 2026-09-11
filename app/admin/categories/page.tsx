import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import CategoryManager from "./CategoryManager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("display_order");

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Categories</h1>
      <CategoryManager categories={(categories as Category[]) ?? []} />
    </div>
  );
}
