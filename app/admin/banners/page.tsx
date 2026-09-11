import { createClient } from "@/lib/supabase/server";
import type { Banner } from "@/lib/types";
import BannerManager from "./BannerManager";

export const revalidate = 0;

export default async function AdminBannersPage() {
  const supabase = createClient();
  const { data: banners } = await supabase.from("banners").select("*").order("display_order");

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Hero Banners</h1>
      <p className="mt-1 text-sm text-bone/50">
        Shown on the home page hero. Add one for a static hero, or two+ for an auto-playing
        slideshow. Each can be an image or a video.
      </p>
      <BannerManager banners={(banners as Banner[]) ?? []} />
    </div>
  );
}
