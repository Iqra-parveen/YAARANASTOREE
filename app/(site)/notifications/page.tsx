import { createClient } from "@/lib/supabase/server";
import TopBar from "@/components/TopBar";
import type { Notification } from "@/lib/types";

export const revalidate = 0;

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div>
      <TopBar title="Notifications" />
      <div className="flex flex-col">
        {(!notifications || notifications.length === 0) && (
          <p className="px-4 py-10 text-center text-sm text-bone/40">Nothing new right now.</p>
        )}
        {(notifications as Notification[] | null)?.map((n) => (
          <div key={n.id} className="border-b border-hairline px-4 py-4">
            <p className="text-sm text-bone">{n.title}</p>
            <p className="mt-1 text-sm text-bone/60">{n.message}</p>
            <p className="mt-2 text-xs text-gold-dim">
              {new Date(n.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
