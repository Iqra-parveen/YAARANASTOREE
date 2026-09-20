"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { SizeGuide } from "@/lib/types";

export default function SizeGuideModal({
  guide,
  isOpen,
  onClose,
}: {
  guide: SizeGuide;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bone/50"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 bottom-4 top-auto z-50 mx-auto max-w-app border border-hairline bg-ink p-4 shadow-2xl sm:inset-x-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2"
          >
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h2 className="font-display text-lg italic text-bone">Size Guide</h2>
              <button onClick={onClose} className="focus-gold text-bone/60" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline text-xs text-bone/50">
                    <th className="py-2 pr-3">Size</th>
                    {guide.columns.map((col) => (
                      <th key={col} className="py-2 pr-3">
                        {col} ({guide.unit})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.rows.map((row) => (
                    <tr key={row.size} className="border-b border-hairline last:border-0">
                      <td className="py-2 pr-3 text-gold">{row.size}</td>
                      {row.values.map((v, i) => (
                        <td key={i} className="py-2 pr-3 text-bone/80">
                          {v || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-bone/40">
              Measurements are approximate. If you're between sizes, we recommend sizing up.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}