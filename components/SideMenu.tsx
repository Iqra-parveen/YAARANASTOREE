"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";

export default function SideMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("*")
      .eq("status", "active")
      .order("display_order")
      .then(({ data }) => setCategories((data as Category[]) ?? []));
  }, []);

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-bone/40"
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed left-0 top-0 z-50 flex h-full w-[80%] max-w-[340px] flex-col bg-ink shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-hairline px-4 py-4">
              <span className="font-display text-lg italic text-bone">YAARANA</span>
              <button onClick={onClose} className="focus-gold text-bone/60" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <p className="mb-2 text-xs tracking-wide text-bone/50">Categories</p>
              <div className="flex flex-col">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop?category=${c.slug}`}
                    onClick={onClose}
                    className="focus-gold border-b border-hairline py-3 text-sm text-bone/80"
                  >
                    {c.name}
                  </Link>
                ))}
                {categories.length === 0 && (
                  <p className="py-3 text-xs text-bone/40">No categories yet.</p>
                )}
              </div>

              <p className="mb-2 mt-6 text-xs tracking-wide text-bone/50">Help</p>
              <div className="flex flex-col">
                <Link
                  href="/care"
                  onClick={onClose}
                  className="focus-gold border-b border-hairline py-3 text-sm text-bone/80"
                >
                  Customer Care
                </Link>
                <Link
                  href="/about"
                  onClick={onClose}
                  className="focus-gold border-b border-hairline py-3 text-sm text-bone/80"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="focus-gold border-b border-hairline py-3 text-sm text-bone/80"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}