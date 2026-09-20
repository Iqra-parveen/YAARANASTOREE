import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SizeGuideForm from "./SizeGuideForm";
import type { Category, SizeGuide } from "@/lib/types";

export const revalidate = 0;

export default async function EditSizeGuidePage({ params }: { params: { categoryId: string } }) {
  const supabase = createClient();
  const [{ data: category }, { data: guide }] = await Promise.all([
    supabase.from("categories").select("*").eq("id", params.categoryId).single(),
    supabase.from("size_guides").select("*").eq("category_id", params.categoryId).maybeSingle(),
  ]);

  if (!category) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Size Guide — {category.name}</h1>
      <p className="mt-1 text-sm text-bone/50">
        Define the measurement columns (e.g. "Chest, Length, Shoulder"), then fill in a row for each
        size. Leave a size's row blank if you don't stock it.
      </p>
      <SizeGuideForm category={category as Category} guide={guide as SizeGuide | null} />
    </div>
  );
}