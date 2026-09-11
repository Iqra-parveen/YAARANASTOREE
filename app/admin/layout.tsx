import Link from "next/link";
import { LayoutDashboard, Package, FolderTree, ClipboardList, Ticket, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSignOut from "./AdminSignOut";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: Ticket },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-ink text-bone">
      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-hairline p-4 md:flex">
          <Link href="/admin" className="font-display text-xl italic text-bone">
            YAARANA
          </Link>
          <p className="mb-6 mt-0.5 text-xs text-gold-dim">Admin Panel</p>
          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-gold flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-bone/70 hover:bg-charcoal hover:text-bone"
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
          </nav>
          <AdminSignOut />
        </aside>
        <main className="min-h-dvh flex-1 p-5 md:p-8">
          <div className="mb-6 flex items-center justify-between md:hidden">
            <span className="font-display text-lg italic text-bone">YAARANA Admin</span>
            <AdminSignOut compact />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
