"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { STANDARD_SIZES } from "@/lib/product-constants";
import type { ProductVariant } from "@/lib/types";

const emptyForm = { size: STANDARD_SIZES[0], colors: "", stock: "0", price_override: "" };

export default function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: ProductVariant[];
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function addVariants(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Colors are comma-separated — one variant row gets created per color,
    // all sharing the selected size, stock, and price override. Leave colors
    // blank to add a single size-only variant (no color split).
    const colorList = form.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const rows = (colorList.length > 0 ? colorList : [null]).map((color) => ({
      product_id: productId,
      size: form.size || null,
      color,
      stock: Number(form.stock || 0),
      price_override: form.price_override ? Number(form.price_override) : null,
      status: "active" as const,
    }));

    setSaving(true);
    const { error } = await supabase.from("product_variants").insert(rows);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setForm({ ...emptyForm, size: form.size });
    router.refresh();
  }

  async function updateStock(v: ProductVariant, stock: number) {
    await supabase.from("product_variants").update({ stock }).eq("id", v.id);
    router.refresh();
  }

  async function toggleStatus(v: ProductVariant) {
    await supabase
      .from("product_variants")
      .update({ status: v.status === "active" ? "inactive" : "active" })
      .eq("id", v.id);
    router.refresh();
  }

  async function remove(v: ProductVariant) {
    if (!confirm("Delete this variant?")) return;
    await supabase.from("product_variants").delete().eq("id", v.id);
    router.refresh();
  }

  return (
    <div className="mt-8 max-w-xl border-t border-hairline pt-6">
      <h2 className="font-display text-lg italic text-bone">Size / Color Variants</h2>
      <p className="mt-1 text-xs text-bone/50">
        Pick a size, then list every color it comes in separated by commas (e.g. "Black, White, Olive")
        — one variant is created per color, all with the stock and price you set below.
      </p>

      <form onSubmit={addVariants} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <select
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        >
          {STANDARD_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          placeholder="Colors, comma-separated"
          value={form.colors}
          onChange={(e) => setForm({ ...form, colors: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone sm:col-span-2"
        />
        <input
          type="number"
          min="0"
          placeholder="Stock (each)"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price override (optional)"
          value={form.price_override}
          onChange={(e) => setForm({ ...form, price_override: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone sm:col-span-3"
        />
        <Button type="submit" disabled={saving} className="col-span-2 sm:col-span-1">
          {saving ? "Adding..." : "Add"}
        </Button>
      </form>
      {error && <p className="mt-2 text-xs text-rust">{error}</p>}

      <div className="mt-4 flex flex-col gap-2">
        {variants.map((v) => (
          <div
            key={v.id}
            className="flex flex-wrap items-center gap-3 border border-hairline px-3 py-2 text-sm"
          >
            <span className="text-bone">
              {[v.size, v.color].filter(Boolean).join(" / ") || "Default"}
            </span>
            {v.price_override != null && (
              <span className="text-xs text-gold">Rs {v.price_override}</span>
            )}
            <label className="ml-auto flex items-center gap-1 text-xs text-bone/60">
              Stock:
              <input
                type="number"
                min="0"
                defaultValue={v.stock}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  if (n !== v.stock) updateStock(v, n);
                }}
                className="focus-gold w-16 rounded-sm border border-hairline bg-charcoal px-2 py-1 text-bone"
              />
            </label>
            <button
              onClick={() => toggleStatus(v)}
              className={`focus-gold text-xs ${v.status === "active" ? "text-gold" : "text-bone/40"}`}
            >
              {v.status === "active" ? "Active" : "Hidden"}
            </button>
            <button onClick={() => remove(v)} className="focus-gold text-rust">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {variants.length === 0 && (
          <p className="border border-hairline px-3 py-4 text-center text-xs text-bone/40">
            No variants yet — this product uses its base price/stock only.
          </p>
        )}
      </div>
    </div>
  );
}