import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import Reveal from "@/components/Reveal";

export const revalidate = 0;

export default async function ContactPage() {
  const supabase = createClient();
  const { data } = await supabase.from("site_content").select("*").eq("page_key", "contact_us").single();

  return (
    <div>
      <TopBar title="Contact Us" />
      <Reveal className="px-4 pt-6">
        <h1 className="font-display text-2xl italic text-bone">{data?.title ?? "Get in touch"}</h1>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-bone/70">
          {data?.body ?? "Content coming soon."}
        </p>
      </Reveal>
    </div>
  );
}
