"use client";

import { motion } from "framer-motion";

/**
 * Fades + slides content up into place as it scrolls into view. Wrap any
 * section or card with this for the subtle premium scroll-reveal effect.
 * `delay` lets you stagger multiple items (e.g. a product grid).
 */
export default function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
