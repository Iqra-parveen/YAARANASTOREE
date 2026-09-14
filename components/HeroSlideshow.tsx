"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import type { Banner } from "@/lib/types";

const SLIDE_DURATION_MS = 5000;

export default function HeroSlideshow({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = banners.length > 1;
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax: as the hero scrolls out of view, the image drifts vertically
  // slower than the page — the classic "depth" scroll effect.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  const goTo = useCallback(
    (i: number) => setIndex(((i % banners.length) + banners.length) % banners.length),
    [banners.length]
  );

  useEffect(() => {
    if (!hasMultiple) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), SLIDE_DURATION_MS);
    return () => clearInterval(t);
  }, [hasMultiple, banners.length]);

  if (banners.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center bg-charcoal px-6 text-center">
        <p className="font-display text-lg italic text-bone/60">New season, same yaarana.</p>
      </div>
    );
  }

  const current = banners[index];

  const Media = (
    <div ref={containerRef} className="group relative aspect-[16/9] w-full overflow-hidden bg-charcoal">
      <AnimatePresence mode="sync">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Parallax wrapper (moves with scroll) */}
          <motion.div style={{ y: parallaxY }} className="absolute inset-[-10%]">
            {/* Ken Burns wrapper (slow continuous zoom) + hover response */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.1 }}
              className="h-full w-full"
            >
              {current.media_type === "video" ? (
                <video
                  src={current.image_url}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                // Plain <img> here (not next/image) so admins can point banners at any
                // host — video URLs already need this, and it keeps both media types
                // on the same code path.
                <img
                  src={current.image_url}
                  alt={current.title ?? "YAARANA"}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>
          </motion.div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bone/70 via-bone/10 to-transparent" />
          {current.title && (
            <p className="pointer-events-none absolute bottom-4 left-4 font-display text-xl italic text-ink drop-shadow-sm">
              {current.title}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {hasMultiple && (
        <div className="absolute bottom-3 right-4 z-10 flex gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={(e) => {
                e.preventDefault();
                goTo(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all hover:opacity-80 ${
                i === index ? "w-4 bg-ink" : "w-1.5 bg-ink/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return current.link_url ? <Link href={current.link_url}>{Media}</Link> : Media;
}