import { createClient } from "@/lib/supabase/server";
import type { PromoCode } from "@/lib/types";
import PromoManager from "./PromoManager";

export const revalidate = 0;

export default async function AdminPromoCodesPage() {
  const supabase = createClient();
  const { data: promos } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl italic text-bone">Promo Codes</h1>
      <PromoManager promos={(promos as PromoCode[]) ?? []} />
    </div>
  );
}
