import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import PromoStrip from "@/components/home/PromoStrip";
import HeroHeadingSection from "@/components/home/HeroHeadingSection";
import MarqueeSection from "@/components/home/MarqueeSection";
import AboutSection from "@/components/home/AboutSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedStackSection from "@/components/home/FeaturedStackSection";
import type { Category, Product, Banner } from "@/lib/types";

export const revalidate = 0;

const FALLBACK_ABOUT =
  "With more than a season of yaarana with quality, we focus on premium streetwear — T-shirts, hoodies, trousers, and jackets built to feel like they were made for you. Let's build your wardrobe together.";

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: categories }, { data: featured }, { data: banners }, { data: aboutContent }, { data: promos }] =
    await Promise.all([
      supabase.from("categories").select("*").eq("status", "active").order("display_order"),
      supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("status", "active")
        .eq("featured", true)
        .limit(6),
      supabase.from("banners").select("*").eq("status", "active").order("display_order"),
      supabase.from("site_content").select("*").eq("page_key", "about_us").single(),
      // promo_codes itself is admin-only via RLS, so the public banner goes
      // through a SECURITY DEFINER function that only exposes code/discount
      // for currently-valid codes — not the whole table.
      supabase.rpc("get_active_promo_banner"),
    ]);

  const featuredProducts = (featured as Product[] | null) ?? [];
  const marqueeImages = featuredProducts
    .filter((p) => p.image_url && p.media_type !== "video")
    .map((p) => p.image_url as string);

  return (
    <div>
      <TopBar />
      <PromoStrip promos={promos ?? []} />
      <HeroHeadingSection banners={(banners as Banner[]) ?? []} />
      <MarqueeSection images={marqueeImages} />
      <AboutSection text={aboutContent?.body ?? FALLBACK_ABOUT} />
      <CategoriesSection categories={(categories as Category[]) ?? []} />
      <FeaturedStackSection products={featuredProducts} />
    </div>
  );
}