"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import type { Category } from "@/lib/types";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("categories").insert({
      name,
      slug: slugify(name),
      display_order: categories.length,
      status: "active",
    });
    setSaving(false);
    setName("");
    router.refresh();
  }

  async function toggleStatus(c: Category) {
    await supabase
      .from("categories")
      .update({ status: c.status === "active" ? "inactive" : "active" })
      .eq("id", c.id);
    router.refresh();
  }

  async function remove(c: Category) {
    if (!confirm(`Delete "${c.name}"? Products in it will be uncategorized.`)) return;
    await supabase.from("categories").delete().eq("id", c.id);
    router.refresh();
  }

  async function move(c: Category, direction: -1 | 1) {
    const idx = categories.findIndex((x) => x.id === c.id);
    const swapWith = categories[idx + direction];
    if (!swapWith) return;
    await Promise.all([
      supabase.from("categories").update({ display_order: swapWith.display_order }).eq("id", c.id),
      supabase.from("categories").update({ display_order: c.display_order }).eq("id", swapWith.id),
    ]);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={addCategory} className="mt-6 flex max-w-md gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="focus-gold flex-1 rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        />
        <Button type="submit" disabled={saving} className="w-auto px-4">
          Add
        </Button>
      </form>

      <div className="mt-6 max-w-2xl border border-hairline">
        {categories.map((c, idx) => (
          <div
            key={c.id}
            className="flex items-center justify-between border-b border-hairline px-4 py-3 last:border-0"
          >
            <div>
              <p className="text-sm text-bone">{c.name}</p>
              <p className="text-xs capitalize text-bone/50">{c.status}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button onClick={() => move(c, -1)} disabled={idx === 0} className="focus-gold text-bone/50 disabled:opacity-20">
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => move(c, 1)}
                disabled={idx === categories.length - 1}
                className="focus-gold text-bone/50 disabled:opacity-20"
              >
                <ArrowDown size={14} />
              </button>
              <button onClick={() => toggleStatus(c)} className="focus-gold text-gold">
                {c.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => remove(c)} className="focus-gold text-rust">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-bone/40">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
