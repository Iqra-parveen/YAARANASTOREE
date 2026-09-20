import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types";

export const revalidate = 0;

export default async function AdminSizeGuidesPage() {
  const supabase = createClient();
  const [{ data: categories }, { data: guides }] = await Promise.all([
    supabase.from("categories").select("*").order("display_order"),
    supabase.from("size_guides").select("category_id"),
  ]);

  const guideCategoryIds = new Set((guides ?? []).map((g) => g.category_id));

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Size Guides</h1>
      <p className="mt-1 text-sm text-bone/50">
        One size chart per category — every product in that category (e.g. all T-Shirts) shares it.
      </p>

      <div className="mt-6 max-w-xl border border-hairline">
        {((categories as Category[] | null) ?? []).map((c) => (
          <Link
            key={c.id}
            href={`/admin/size-guides/${c.id}`}
            className="focus-gold flex items-center justify-between border-b border-hairline px-4 py-3 last:border-0"
          >
            <span className="text-sm text-bone">{c.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${guideCategoryIds.has(c.id) ? "text-gold" : "text-bone/40"}`}>
                {guideCategoryIds.has(c.id) ? "Has size guide" : "No guide yet"}
              </span>
              <ChevronRight size={16} className="text-bone/30" />
            </div>
          </Link>
        ))}
        {(!categories || categories.length === 0) && (
          <p className="px-4 py-6 text-center text-sm text-bone/40">
            Add a category first — size guides attach to categories.
          </p>
        )}
      </div>
    </div>
  );
}