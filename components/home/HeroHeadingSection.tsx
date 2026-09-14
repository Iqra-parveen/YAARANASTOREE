"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroSlideshow from "@/components/HeroSlideshow";
import type { Banner } from "@/lib/types";

const EASE = [0.25, 0.1, 0.25, 1] as const;

export default function HeroHeadingSection({ banners }: { banners: Banner[] }) {
  return (
    <section className="flex flex-col overflow-hidden pb-2 pt-4">
      <div className="overflow-hidden px-2">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="text-gradient-onlight whitespace-nowrap text-center font-display text-[10vw] font-black uppercase leading-none tracking-tight sm:text-[9vw] md:text-[7vw]"
        >
          YAARANA
        </motion.h1>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
        className="mx-auto mt-3 max-w-[240px] text-center text-xs uppercase tracking-wide text-gold-dim"
      >
        Shopping aisay jaisy yaar ki dukan
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
        className="mt-5 flex justify-center"
      >
        <Link
          href="/shop"
          className="focus-gold rounded-full bg-gold px-8 py-3 text-xs font-medium uppercase tracking-widest text-bone transition-transform hover:scale-105 active:scale-95"
        >
          Shop Now
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
        className="mt-8"
      >
        <HeroSlideshow banners={banners} />
      </motion.div>
    </section>
  );
}