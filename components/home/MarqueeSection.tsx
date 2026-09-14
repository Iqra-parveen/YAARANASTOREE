"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

function MarqueeRow({ images, direction }: { images: string[]; direction: 1 | -1 }) {
  const [offset, setOffset] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      if (!rowRef.current) return;
      const sectionTop = rowRef.current.getBoundingClientRect().top + window.scrollY;
      const value = (window.scrollY - sectionTop + window.innerHeight) * 0.3 * direction;
      setOffset(value);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [direction]);

  const tripled = [...images, ...images, ...images];

  return (
    <div ref={rowRef} className="overflow-hidden">
      <div className="flex gap-3" style={{ transform: `translateX(${offset}px)`, willChange: "transform" }}>
        {tripled.map((src, i) => (
          <div
            key={i}
            className="relative h-[130px] w-[190px] shrink-0 overflow-hidden rounded-2xl bg-charcoal sm:h-[160px] sm:w-[230px]"
          >
            <Image src={src} alt="" fill sizes="230px" className="object-cover" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MarqueeSection({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  const mid = Math.ceil(images.length / 2);
  const row1 = images.slice(0, mid);
  const row2 = images.slice(mid).length ? images.slice(mid) : row1;

  return (
    <section className="flex flex-col gap-3 overflow-hidden py-10">
      <MarqueeRow images={row1} direction={1} />
      <MarqueeRow images={row2} direction={-1} />
    </section>
  );
}