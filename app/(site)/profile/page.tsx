"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import TopBar from "@/components/TopBar";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div>
        <TopBar title="Profile" />
        <p className="px-4 pt-8 text-sm text-bone/40">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <TopBar title="Profile" />
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <p className="font-display text-xl italic text-bone">Welcome, yaar.</p>
          <p className="text-sm text-bone/60">Sign in to view orders and track your account.</p>
          <div className="mt-2 flex w-full flex-col gap-3">
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="secondary">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const links = [
    { href: "/orders", label: "My Orders" },
    { href: "/notifications", label: "Notifications" },
  ];

  return (
    <div>
      <TopBar title="Profile" />
      <div className="px-4 pt-6">
        <p className="text-lg text-bone">{profile?.full_name || "Your account"}</p>
        <p className="text-sm text-bone/50">{profile?.email}</p>
      </div>

      <div className="mt-6 flex flex-col border-t border-hairline">
        {profile?.role === "admin" && (
          <Link
            href="/admin"
            className="focus-gold flex items-center justify-between border-b border-hairline px-4 py-4 text-sm text-gold"
          >
            Admin Portal
            <ChevronRight size={16} />
          </Link>
        )}
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="focus-gold flex items-center justify-between border-b border-hairline px-4 py-4 text-sm text-bone/80"
          >
            {l.label}
            <ChevronRight size={16} className="text-bone/30" />
          </Link>
        ))}
      </div>

      <div className="px-4 pt-6">
        <button onClick={signOut} className="focus-gold text-sm text-bone/50">
          Sign out
        </button>
      </div>
    </div>
  );
}