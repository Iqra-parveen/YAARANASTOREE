"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { STANDARD_SIZES } from "@/lib/product-constants";
import type { Category, SizeGuide } from "@/lib/types";

export default function SizeGuideForm({
  category,
  guide,
}: {
  category: Category;
  guide: SizeGuide | null;
}) {
  const router = useRouter();
  const [unit, setUnit] = useState<"in" | "cm">(guide?.unit ?? "in");
  const [columnsText, setColumnsText] = useState(guide?.columns.join(", ") ?? "Chest, Length, Shoulder");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(
    () =>
      columnsText
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    [columnsText]
  );

  const [rowValues, setRowValues] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    STANDARD_SIZES.forEach((s) => {
      const existing = guide?.rows.find((r) => r.size === s);
      map[s] = existing?.values ?? [];
    });
    return map;
  });

  function setCell(size: string, colIndex: number, value: string) {
    setRowValues((prev) => {
      const next = [...(prev[size] ?? [])];
      next[colIndex] = value;
      return { ...prev, [size]: next };
    });
  }

  async function handleSave() {
    setError(null);
    if (columns.length === 0) {
      setError("Add at least one measurement column.");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const rows = STANDARD_SIZES.map((size) => ({
      size,
      values: columns.map((_, i) => rowValues[size]?.[i] ?? ""),
    })).filter((row) => row.values.some((v) => v.trim() !== ""));

    const { error } = await supabase
      .from("size_guides")
      .upsert(
        { category_id: category.id, unit, columns, rows },
        { onConflict: "category_id" }
      );

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin/size-guides");
    router.refresh();
  }

  async function handleRemove() {
    if (!guide) return;
    if (!confirm("Remove the size guide for this category?")) return;
    const supabase = createClient();
    await supabase.from("size_guides").delete().eq("category_id", category.id);
    router.push("/admin/size-guides");
    router.refresh();
  }

  return (
    <div className="mt-6 max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-1 block text-xs text-bone/60">Measurement columns (comma-separated)</span>
          <input
            value={columnsText}
            onChange={(e) => setColumnsText(e.target.value)}
            className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-bone/60">Unit</span>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as "in" | "cm")}
            className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
          >
            <option value="in">Inches</option>
            <option value="cm">Centimeters</option>
          </select>
        </label>
      </div>

      {columns.length > 0 && (
        <div className="mt-6 overflow-x-auto border border-hairline">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs text-bone/50">
                <th className="px-3 py-2">Size</th>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2">
                    {col} ({unit})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STANDARD_SIZES.map((size) => (
                <tr key={size} className="border-b border-hairline last:border-0">
                  <td className="px-3 py-2 text-bone">{size}</td>
                  {columns.map((col, i) => (
                    <td key={col} className="px-3 py-2">
                      <input
                        type="number"
                        step="0.1"
                        value={rowValues[size]?.[i] ?? ""}
                        onChange={(e) => setCell(size, i, e.target.value)}
                        className="focus-gold w-20 rounded-sm border border-hairline bg-charcoal px-2 py-1 text-sm text-bone"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-rust">{error}</p>}

      <div className="mt-6 flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="max-w-xs">
          {saving ? "Saving..." : "Save size guide"}
        </Button>
        {guide && (
          <button onClick={handleRemove} className="focus-gold text-sm text-rust">
            Remove guide
          </button>
        )}
      </div>
    </div>
  );
}