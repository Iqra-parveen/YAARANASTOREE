"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type PromoBannerEntry = {
  code: string;
  discount: number;
  discount_type: "percentage" | "fixed";
  banner_message: string | null;
};

const ROTATE_MS = 4000;

function promoMessage(p: PromoBannerEntry): string {
  if (p.banner_message && p.banner_message.trim()) return p.banner_message;
  const amount = p.discount_type === "percentage" ? `${p.discount}%` : formatPrice(p.discount);
  return `Use code ${p.code} to get ${amount} off`;
}

export default function PromoStrip({ promos }: { promos: PromoBannerEntry[] }) {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const hasMultiple = promos.length > 1;

  useEffect(() => {
    if (!hasMultiple) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % promos.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [hasMultiple, promos.length]);

  if (promos.length === 0 || dismissed) return null;
  const current = promos[index];

  return (
    <div className="relative flex items-center justify-center bg-gold px-8 py-2.5 text-center">
      <Link href="/shop" className="focus-gold overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={current.code}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-xs font-medium uppercase tracking-wide text-bone"
          >
            {promoMessage(current)}
          </motion.p>
        </AnimatePresence>
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="focus-gold absolute right-3 top-1/2 -translate-y-1/2 text-bone/70"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}