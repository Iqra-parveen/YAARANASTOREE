"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";
  const cleanNumber = rawNumber.replace(/[^0-9]/g, "");
  const defaultMessage = encodeURIComponent(
    "Hello YAARANA! I have an inquiry regarding your collection and orders."
  );
  const waUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="WhatsApp Support"
      className="fixed bottom-20 right-4 z-40 flex items-center"
    >
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="focus-gold group flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:scale-110 active:scale-95"
      >
        <MessageCircle size={24} className="fill-white/20" />
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-ink/90 border border-hairline px-2.5 py-1 text-xs font-medium text-bone opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
          Chat with us
        </span>
      </a>
    </aside>
  );
}
