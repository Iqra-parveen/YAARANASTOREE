"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ORDER_STATUSES, statusLabel } from "@/lib/utils";

const EMAIL_TRIGGER_STATUSES = ["confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isUpdating, setIsUpdating] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
      if (error) {
        console.error("[admin] Failed to update order status:", error);
        return;
      }

      const previous = currentStatus;
      setCurrentStatus(newStatus);

      if (EMAIL_TRIGGER_STATUSES.includes(newStatus)) {
        try {
          const res = await fetch("/api/emails/order-status-update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: id, status: newStatus, previousStatus: previous }),
          });
          const data = await res.json().catch(() => null);
          if (!res.ok || !data?.success) {
            console.warn(`[admin] Status email not sent for order ${id}:`, data?.error ?? res.statusText);
          } else {
            console.log(`[admin] Status email successfully sent for order ${id} (${newStatus})`);
          }
        } catch (emailErr) {
          console.warn(`[admin] Failed to trigger order status email for order ${id}:`, emailErr);
        }
      }

      router.refresh();
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <select
      value={currentStatus}
      onChange={onChange}
      disabled={isUpdating}
      className="focus-gold rounded-sm border border-hairline bg-charcoal px-2 py-1 text-xs capitalize text-bone disabled:opacity-50"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabel(s)}
        </option>
      ))}
    </select>
  );
}
