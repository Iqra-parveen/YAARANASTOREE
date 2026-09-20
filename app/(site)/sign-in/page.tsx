"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { isValidEmail } from "@/lib/utils";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address (e.g. abc@gmail.com).");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/profile");
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/profile` },
    });
  }

  return (
    <div className="flex min-h-[100dvh] flex-col justify-center px-6">
      <h1 className="font-display text-3xl italic text-bone">Welcome back</h1>
      <p className="mt-1 text-sm text-bone/60">Sign in to YAARANA</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="Email (e.g. abc@gmail.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2.5 pr-10 text-sm text-bone placeholder:text-bone/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="focus-gold absolute right-3 top-1/2 -translate-y-1/2 text-bone/40"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-rust">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-bone/40">or</span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      <button
        onClick={handleGoogle}
        className="focus-gold rounded-sm border border-hairline py-3 text-sm text-bone/80"
      >
        Continue with Google
      </button>

      <p className="mt-6 text-center text-sm text-bone/60">
        New to YAARANA?{" "}
        <Link href="/sign-up" className="text-gold">
          Create an account
        </Link>
      </p>
    </div>
  );
}