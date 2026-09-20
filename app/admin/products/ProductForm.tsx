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

async function uploadFile(supabase: ReturnType<typeof createClient>, file: File) {
  const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("products").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("products").getPublicUrl(path);
  return { url: data.publicUrl, media_type: mediaType };
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
    compare_at_price: product?.compare_at_price?.toString() ?? "",
    styling_tip: product?.styling_tip ?? "",
    category_id: product?.category_id ?? categories[0]?.id ?? "",
    quantity: product?.quantity?.toString() ?? "0",
    status: product?.status ?? "active",
    featured: product?.featured ?? false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!product && files.length === 0) {
      setError("Please choose at least one image or video file.");
      return;
    }
    if (form.compare_at_price && Number(form.compare_at_price) <= Number(form.price)) {
      setError("Compare-at price must be higher than the price for a sale to show.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      // The first selected file becomes the cover photo (products.image_url) —
      // used everywhere a single thumbnail is needed (grid, cart, etc).
      // Any additional files go into product_images as extra gallery shots.
      let coverFields: { image_url: string; media_type: "image" | "video" } | null = null;
      let galleryFiles = files;

      if (files.length > 0) {
        const cover = await uploadFile(supabase, files[0]);
        coverFields = { image_url: cover.url, media_type: cover.media_type };
        galleryFiles = files.slice(1);
      }

      const payload = {
        name: form.name,
        slug: slugify(form.name),
        description: form.description || null,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        styling_tip: form.styling_tip.trim() || null,
        category_id: form.category_id || null,
        quantity: Number(form.quantity),
        status: form.status,
        featured: form.featured,
        ...(coverFields ?? {}),
      };

      let productId = product?.id;

      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Upload any remaining gallery files now that we have a product id.
      if (galleryFiles.length > 0 && productId) {
        const uploaded = await Promise.all(galleryFiles.map((f) => uploadFile(supabase, f)));
        const { error: galleryError } = await supabase.from("product_images").insert(
          uploaded.map((u, i) => ({
            product_id: productId,
            url: u.url,
            media_type: u.media_type,
            display_order: i,
          }))
        );
        if (galleryError) throw galleryError;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-4">
      {product?.sku && (
        <p className="text-xs text-bone/50">
          SKU: <span className="text-gold">{product.sku}</span> (auto-generated, can't be changed)
        </p>
      )}

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
        <Field label="Compare-at price (optional — shows as a sale)">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Original price before discount"
            value={form.compare_at_price}
            onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
            className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone placeholder:text-bone/30"
          />
        </Field>
      </div>

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

      <Field
        label={
          product
            ? "Replace cover photo (optional)"
            : "Photos/video — first one becomes the cover, rest go in the gallery"
        }
        required={!product}
      >
        {product?.image_url && files.length === 0 && (
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
          multiple={!product}
          onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
          className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone file:mr-3 file:rounded-sm file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:text-bone"
        />
        {files.length > 0 && (
          <p className="mt-1 flex items-center gap-1 text-xs text-bone/50">
            <Upload size={12} /> {files.length} file{files.length > 1 ? "s" : ""} selected
            {files.length > 1 ? " (first = cover, rest = gallery)" : ""}
          </p>
        )}
        {product && (
          <p className="mt-1 text-xs text-bone/40">
            To add more gallery photos to this existing product, use the gallery section below.
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

      <Field label="Styling tip (optional)">
        <textarea
          rows={2}
          value={form.styling_tip}
          onChange={(e) => setForm({ ...form, styling_tip: e.target.value })}
          placeholder="e.g. Pair with high-waisted denim and white sneakers"
          className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone placeholder:text-bone/30"
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

      {!product && (
        <p className="text-xs text-bone/40">
          After saving, you'll be able to add size/color variants from the edit page.
        </p>
      )}
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