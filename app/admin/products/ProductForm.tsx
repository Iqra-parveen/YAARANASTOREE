"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import type { Category, Product } from "@/lib/types";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: Product;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    quantity: product?.quantity?.toString() ?? "0",
    status: product?.status ?? "active",
    featured: product?.featured ?? false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!product && !file) {
      setError("Please choose an image or video file.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    let mediaFields: { image_url: string; media_type: "image" | "video" } | null = null;

    if (file) {
      const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("products").upload(path, file);
      if (uploadError) {
        setSaving(false);
        setError(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(path);
      mediaFields = { image_url: publicUrlData.publicUrl, media_type: mediaType };
    }

    const payload = {
      name: form.name,
      slug: slugify(form.name),
      description: form.description || null,
      price: Number(form.price),
      category_id: form.category_id || null,
      quantity: Number(form.quantity),
      status: form.status,
      featured: form.featured,
      ...(mediaFields ?? {}),
    };

    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Product Name" required>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
          />
        </Field>
        <Field label="Category">
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Price" required>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
          />
        </Field>
        <Field label="Stock Quantity" required>
          <input
            required
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
          />
        </Field>
      </div>

      <Field label={product ? "Replace image/video (optional)" : "Image or video"} required={!product}>
        {product?.image_url && !file && (
          <div className="mb-2 h-24 w-24 overflow-hidden rounded-sm border border-hairline bg-charcoal">
            {product.media_type === "video" ? (
              <video src={product.image_url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            ) : (
              <img src={product.image_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        )}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone file:mr-3 file:rounded-sm file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:text-bone"
        />
        {file && (
          <p className="mt-1 flex items-center gap-1 text-xs text-bone/50">
            <Upload size={12} /> {file.name} ({file.type.startsWith("video/") ? "video" : "image"})
          </p>
        )}
      </Field>

      <Field label="Description">
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
            className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
        <label className="flex items-end gap-2 pb-2 text-sm text-bone/80">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="h-4 w-4 accent-[#96691F]"
          />
          Featured product
        </label>
      </div>

      {error && <p className="text-xs text-rust">{error}</p>}

      <div className="sticky bottom-0 mt-2 border-t border-hairline bg-ink pt-4">
        <Button type="submit" disabled={saving} className="max-w-xs">
          {saving ? "Saving..." : product ? "Save changes" : "Add product"}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-bone/60">
        {label}
        {required && " *"}
      </span>
      {children}
    </label>
  );
}