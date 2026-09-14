"use client";

export type PasswordStrength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

const CONFIG: Record<PasswordStrength, { label: string; bars: number; color: string }> = {
  weak: { label: "Weak", bars: 1, color: "bg-rust" },
  medium: { label: "Medium", bars: 2, color: "bg-gold-dim" },
  strong: { label: "Strong", bars: 3, color: "bg-[#3F7D45]" },
};

export default function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const strength = getPasswordStrength(password);
  const { label, bars, color } = CONFIG[strength];

  return (
    <div className="mt-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < bars ? color : "bg-hairline"}`} />
        ))}
      </div>
      <p
        className={`mt-1 text-xs ${
          strength === "weak" ? "text-rust" : strength === "medium" ? "text-gold-dim" : "text-[#3F7D45]"
        }`}
      >
        {label}
        {password.length < 8 && " — needs at least 8 characters"}
      </p>
    </div>
  );
}