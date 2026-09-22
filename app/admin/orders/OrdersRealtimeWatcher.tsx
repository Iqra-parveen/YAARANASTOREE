"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Mounts a Supabase Realtime subscription on the `orders` table.
 * On any INSERT or UPDATE the admin orders page is refreshed automatically.
 * This component renders nothing visible — it is a pure side-effect component.
 */
export default function OrdersRealtimeWatcher() {
  const router = useRouter();

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          console.log("[admin] New order received:", payload.new?.tracking_id);
          refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          console.log("[admin] Order updated:", payload.new?.tracking_id, "→", payload.new?.status);
          refresh();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[admin] Realtime orders subscription active");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  return null;
}
