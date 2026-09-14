"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import PasswordStrengthBar from "@/components/PasswordStrengthBar";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-2xl italic text-bone">Check your inbox</h1>
        <p className="mt-2 text-sm text-bone/60">
          We've sent a confirmation link to {email}. Confirm it, then sign in.
        </p>
        <Link href="/sign-in" className="mt-6 text-sm text-gold">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-6">
      <h1 className="font-display text-3xl italic text-bone">Join YAARANA</h1>
      <p className="mt-1 text-sm text-bone/60">Create your account</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
        />
        <div>
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
          />
          <PasswordStrengthBar password={password} />
        </div>
        {error && <p className="text-xs text-rust">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-bone/60">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-gold">
          Sign in
        </Link>
      </p>
    </div>
  );
}