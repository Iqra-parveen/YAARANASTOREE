"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminSignOut({ compact }: { compact?: boolean }) {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }
  return (
    <button
      onClick={signOut}
      className="focus-gold flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-bone/50 hover:text-bone"
    >
      <LogOut size={16} />
      {!compact && "Sign out"}
    </button>
  );
}
