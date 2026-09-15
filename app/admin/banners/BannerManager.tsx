"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import type { Banner } from "@/lib/types";

const emptyForm = {
  title: "",
  link_url: "",
};

export default function BannerManager({ banners }: { banners: Banner[] }) {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function addBanner(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please choose an image or video file.");
      return;
    }
    setSaving(true);

    const mediaType: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("banners").upload(path, file);
    if (uploadError) {
      setSaving(false);
      setError(uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("banners").getPublicUrl(path);

    const { error: insertError } = await supabase.from("banners").insert({
      title: form.title || null,
      media_type: mediaType,
      image_url: publicUrlData.publicUrl,
      link_url: form.link_url.trim() || null,
      display_order: banners.length,
      status: "active",
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setForm(emptyForm);
    setFile(null);
    router.refresh();
  }

  async function toggleStatus(b: Banner) {
    await supabase
      .from("banners")
      .update({ status: b.status === "active" ? "inactive" : "active" })
      .eq("id", b.id);
    router.refresh();
  }

  async function remove(b: Banner) {
    if (!confirm("Delete this banner?")) return;
    await supabase.from("banners").delete().eq("id", b.id);
    router.refresh();
  }

  async function move(b: Banner, direction: -1 | 1) {
    const idx = banners.findIndex((x) => x.id === b.id);
    const swapWith = banners[idx + direction];
    if (!swapWith) return;
    await Promise.all([
      supabase.from("banners").update({ display_order: swapWith.display_order }).eq("id", b.id),
      supabase.from("banners").update({ display_order: b.display_order }).eq("id", swapWith.id),
    ]);
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={addBanner} className="mt-6 grid max-w-2xl grid-cols-1 gap-3 md:grid-cols-2">
        <input
          placeholder="Title (optional, shown as a caption)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone md:col-span-2"
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone file:mr-3 file:rounded-sm file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:text-bone md:col-span-2"
        />
        {file && (
          <p className="-mt-1 flex items-center gap-1 text-xs text-bone/50 md:col-span-2">
            <Upload size={12} /> {file.name} ({file.type.startsWith("video/") ? "video" : "image"})
          </p>
        )}
        <input
          placeholder="Link URL (optional — where tapping the banner goes, e.g. /shop?category=hoodies)"
          value={form.link_url}
          onChange={(e) => setForm({ ...form, link_url: e.target.value })}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2 text-sm text-bone md:col-span-2"
        />
        <Button type="submit" disabled={saving} className="md:col-span-2">
          {saving ? "Uploading..." : "Add banner"}
        </Button>
      </form>
      {error && <p className="mt-2 text-xs text-rust">{error}</p>}

      <div className="mt-6 max-w-2xl border border-hairline">
        {banners.map((b, idx) => (
          <div
            key={b.id}
            className="flex flex-col gap-3 border-b border-hairline px-4 py-3 last:border-0 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-20 shrink-0 overflow-hidden bg-charcoal">
                {b.media_type === "video" ? (
                  <video src={b.image_url} className="h-full w-full object-cover" muted />
                ) : (
                  <img src={b.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-bone">{b.title || "Untitled banner"}</p>
                <p className="text-xs capitalize text-bone/50">
                  {b.media_type} · {b.status}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:shrink-0">
              <button onClick={() => move(b, -1)} disabled={idx === 0} className="focus-gold text-bone/50 disabled:opacity-20">
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => move(b, 1)}
                disabled={idx === banners.length - 1}
                className="focus-gold text-bone/50 disabled:opacity-20"
              >
                <ArrowDown size={14} />
              </button>
              <button onClick={() => toggleStatus(b)} className="focus-gold text-gold">
                {b.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => remove(b)} className="focus-gold text-rust">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-bone/40">No banners yet.</p>
        )}
      </div>
    </div>
  );
}