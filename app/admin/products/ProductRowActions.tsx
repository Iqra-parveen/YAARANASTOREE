"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProductRowActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function toggleStatus() {
    const supabase = createClient();
    await supabase
      .from("products")
      .update({ status: status === "active" ? "inactive" : "active" })
      .eq("id", id);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <Link href={`/admin/products/${id}/edit`} className="focus-gold text-gold">
        Edit
      </Link>
      <button onClick={toggleStatus} className="focus-gold text-bone/60">
        {status === "active" ? "Deactivate" : "Activate"}
      </button>
      <button onClick={remove} className="focus-gold text-rust">
        Delete
      </button>
    </div>
  );
}
