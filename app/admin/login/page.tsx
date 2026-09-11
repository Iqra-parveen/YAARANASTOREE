"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setLoading(false);
      setError(error?.message ?? "Sign in failed");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    setLoading(false);
    if (profile?.role !== "admin") {
      setError("This account does not have admin access.");
      await supabase.auth.signOut();
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl italic text-bone">Admin Portal</h1>
        <p className="mt-1 text-sm text-bone/60">Sign in to manage YAARANA</p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
          />
          {error && <p className="text-xs text-rust">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
