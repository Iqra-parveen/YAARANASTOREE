"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import type { ProductImage } from "@/lib/types";

export default function GalleryManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function addPhotos(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (files.length === 0) return;
    setSaving(true);

    try {
      const startOrder = images.length;
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
          const ext = file.name.split(".").pop();
          const path = `${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage.from("products").upload(path, file);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from("products").getPublicUrl(path);
          return { url: data.publicUrl, media_type: mediaType };
        })
      );

      const { error: insertError } = await supabase.from("product_images").insert(
        uploaded.map((u, i) => ({
          product_id: productId,
          url: u.url,
          media_type: u.media_type,
          display_order: startOrder + i,
        }))
      );
      if (insertError) throw insertError;

      setFiles([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(img: ProductImage) {
    if (!confirm("Remove this photo from the gallery?")) return;
    await supabase.from("product_images").delete().eq("id", img.id);
    router.refresh();
  }

  return (
    <div className="mt-8 max-w-xl border-t border-hairline pt-6">
      <h2 className="font-display text-lg italic text-bone">Additional Gallery Photos</h2>
      <p className="mt-1 text-xs text-bone/50">
        These show alongside the cover photo on the product page. The cover photo itself is set above.
      </p>

      <form onSubmit={addPhotos} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
          className="focus-gold flex-1 rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone file:mr-3 file:rounded-sm file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:text-bone"
        />
        <Button type="submit" disabled={saving || files.length === 0} className="sm:w-auto sm:px-6">
          {saving ? "Uploading..." : "Add to gallery"}
        </Button>
      </form>
      {files.length > 0 && (
        <p className="mt-1 flex items-center gap-1 text-xs text-bone/50">
          <Upload size={12} /> {files.length} file{files.length > 1 ? "s" : ""} selected
        </p>
      )}
      {error && <p className="mt-2 text-xs text-rust">{error}</p>}

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden border border-hairline bg-charcoal">
            {img.media_type === "video" ? (
              <video src={img.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            ) : (
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            )}
            <button
              onClick={() => remove(img)}
              className="absolute right-1 top-1 rounded-sm bg-ink/80 p-1 text-rust opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove photo"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="col-span-3 border border-hairline px-3 py-6 text-center text-xs text-bone/40 sm:col-span-4">
            No additional photos yet — just the cover photo shows.
          </p>
        )}
      </div>
    </div>
  );
}