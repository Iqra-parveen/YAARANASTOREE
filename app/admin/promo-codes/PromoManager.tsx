"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { PromoCode } from "@/lib/types";

const emptyForm = {
  code: "",
  discount: "",
  discount_type: "percentage" as "percentage" | "fixed",
  min_order_amount: "0",
  max_discount_amount: "",
  usage_limit: "",
  expiry_date: "",
};

export default function PromoManager({ promos }: { promos: PromoCode[] }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function addPromo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.code || !form.discount) return;
    setSaving(true);
    const { error } = await supabase.from("promo_codes").insert({
      code: form.code.toUpperCase(),
      discount: Number(form.discount),
      discount_type: form.discount_type,
      min_order_amount: Number(form.min_order_amount || 0),
      max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
      status: "active",
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setForm(emptyForm);
    router.refresh();
  }

  async function toggleStatus(p: PromoCode) {
    await supabase
      .from("promo_codes")
      .update({ status: p.status === "active" ? "inactive" : "active" })
      .eq("id", p.id);
    router.refresh();
  }

  async function remove(p: PromoCode) {
    if (!confirm(`Delete code "${p.code}"?`)) return;
    await supabase.from("promo_codes").delete().eq("id", p.id);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={addPromo} className="mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        <input
          placeholder="CODE"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        />
        <select
          value={form.discount_type}
          onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percentage" | "fixed" })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        >
          <option value="percentage">% Percentage</option>
          <option value="fixed">Fixed amount</option>
        </select>
        <input
          type="number"
          placeholder="Discount value"
          value={form.discount}
          onChange={(e) => setForm({ ...form, discount: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        />
        <input
          type="number"
          placeholder="Min order amount"
          value={form.min_order_amount}
          onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        />
        <input
          type="number"
          placeholder="Max discount (optional)"
          value={form.max_discount_amount}
          onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        />
        <input
          type="number"
          placeholder="Usage limit (optional)"
          value={form.usage_limit}
          onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        />
        <input
          type="date"
          value={form.expiry_date}
          onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        />
        <Button type="submit" disabled={saving} className="sm:col-span-2 md:col-span-1">
          {saving ? "Adding..." : "Add code"}
        </Button>
      </form>
      {error && <p className="mt-2 text-xs text-rust">{error}</p>}

      {/* Desktop: table */}
      <div className="mt-6 hidden overflow-x-auto border border-hairline md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs text-bone/50">
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Discount</th>
              <th className="px-3 py-2">Used</th>
              <th className="px-3 py-2">Expiry</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-b border-hairline last:border-0">
                <td className="px-3 py-2 text-gold">{p.code}</td>
                <td className="px-3 py-2 text-bone/80">
                  {p.discount_type === "percentage" ? `${p.discount}%` : formatPrice(p.discount)}
                </td>
                <td className="px-3 py-2 text-bone/60">
                  {p.usage_count}
                  {p.usage_limit ? ` / ${p.usage_limit}` : ""}
                </td>
                <td className="px-3 py-2 text-bone/60">
                  {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : "—"}
                </td>
                <td className="px-3 py-2 capitalize text-bone/60">{p.status}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-3 text-xs">
                    <button onClick={() => toggleStatus(p)} className="focus-gold text-gold">
                      {p.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button onClick={() => remove(p)} className="focus-gold text-rust">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-bone/40">
                  No promo codes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="mt-6 flex flex-col gap-3 md:hidden">
        {promos.map((p) => (
          <div key={p.id} className="border border-hairline p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gold">{p.code}</span>
              <span className="text-sm text-bone/80">
                {p.discount_type === "percentage" ? `${p.discount}%` : formatPrice(p.discount)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bone/60">
              <span>
                Used: {p.usage_count}
                {p.usage_limit ? ` / ${p.usage_limit}` : ""}
              </span>
              <span>Expires: {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : "—"}</span>
              <span className="capitalize">{p.status}</span>
            </div>
            <div className="mt-3 flex gap-4 border-t border-hairline pt-2 text-xs">
              <button onClick={() => toggleStatus(p)} className="focus-gold text-gold">
                {p.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => remove(p)} className="focus-gold text-rust">
                Delete
              </button>
            </div>
          </div>
        ))}
        {promos.length === 0 && (
          <p className="border border-hairline px-3 py-6 text-center text-sm text-bone/40">
            No promo codes yet.
          </p>
        )}
      </div>
    </div>
  );
}