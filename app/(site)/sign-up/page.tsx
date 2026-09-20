"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import PasswordStrengthBar, { getPasswordRequirements } from "@/components/PasswordStrengthBar";
import { isValidEmail } from "@/lib/utils";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address (e.g. abc@gmail.com).");
      return;
    }
    if (!getPasswordRequirements(password).allMet) {
      setError(
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
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
          placeholder="Email (e.g. abc@gmail.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-gold rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
        />

        <div>
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