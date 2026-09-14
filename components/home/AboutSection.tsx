"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import AnimatedText from "@/components/AnimatedText";

export default function AboutSection({ text }: { text: string }) {
  return (
    <section className="flex flex-col items-center gap-10 px-6 py-20 text-center">
      <Reveal>
        <h2 className="text-gradient-onlight font-display text-[12vw] font-black uppercase leading-none tracking-tight sm:text-[9vw] md:text-6xl">
          About
        </h2>
      </Reveal>
      <AnimatedText text={text} className="max-w-[420px] text-sm leading-relaxed text-bone/80" />
      <Link
        href="/about"
        className="focus-gold rounded-full border-2 border-gold px-8 py-3 text-xs font-medium uppercase tracking-widest text-gold transition-colors hover:bg-gold/10"
      >
        Our Story
      </Link>
    </section>
  );
}