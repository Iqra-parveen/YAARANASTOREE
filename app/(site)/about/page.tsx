import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import Reveal from "@/components/Reveal";

export const revalidate = 0;

export default async function AboutPage() {
  const supabase = createClient();
  const { data } = await supabase.from("site_content").select("*").eq("page_key", "about_us").single();

  return (
    <div>
      <TopBar title="About Us" />
      <Reveal className="px-4 pt-6">
        <h1 className="font-display text-2xl italic text-bone">{data?.title ?? "About YAARANA"}</h1>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-bone/70">
          {data?.body ?? "Content coming soon."}
        </p>
      </Reveal>
    </div>
  );
}
