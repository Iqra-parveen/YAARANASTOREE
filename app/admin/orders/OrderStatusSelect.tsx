"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUSES, statusLabel } from "@/lib/utils";

export default function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const supabase = createClient();
    await supabase.from("orders").update({ status: e.target.value }).eq("id", id);
    router.refresh();
  }

  return (
    <select
      defaultValue={status}
      onChange={onChange}
      className="focus-gold rounded-sm border border-hairline bg-charcoal px-2 py-1 text-xs capitalize text-bone"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      ))}
    </select>
  );
}
