"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  FolderTree,
  Image as ImageIcon,
  ClipboardList,
  Ticket,
  Ruler,
} from "lucide-react";
import AdminSignOut from "./AdminSignOut";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/size-guides", label: "Size Guides", icon: Ruler },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: Ticket },
];

export default function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setOpen(true)}
          className="focus-gold text-bone/80"
          aria-label="Open admin menu"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
        <span className="font-display text-lg italic text-bone">YAARANA Admin</span>
        <AdminSignOut compact />
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-bone/40"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              key="panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed left-0 top-0 z-50 flex h-full w-[78%] max-w-[300px] flex-col bg-ink shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-hairline px-4 py-4">
                <span className="font-display text-lg italic text-bone">YAARANA</span>
                <button
                  onClick={() => setOpen(false)}
                  className="focus-gold text-bone/60"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-4">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`focus-gold flex items-center gap-3 rounded-sm px-3 py-3 text-sm ${
                        active ? "bg-gold/10 text-gold" : "text-bone/70"
                      }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-hairline p-4">
                <AdminSignOut />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}