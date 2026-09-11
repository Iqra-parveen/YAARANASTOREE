"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 border-t border-hairline bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-app items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="focus-gold flex flex-1 flex-col items-center gap-1 py-3 text-xs"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.25 : 1.5}
                className={active ? "text-gold" : "text-bone/50"}
              />
              <span className={active ? "text-gold" : "text-bone/50"}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
