"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/home"), 2600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="app-shell items-center justify-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <h1 className="font-display text-4xl tracking-tight text-bone">YAARANA</h1>
        <p className="-mt-4 text-sm text-gold-dim">Shopping asisy yaar ki dukan</p>

        <div className="hourglassBackground" aria-label="Loading" role="status">
          <div className="hourglassContainer">
            <div className="hourglassCurves" />
            <div className="hourglassCapTop" />
            <div className="hourglassGlassTop" />
            <div className="hourglassGlass" />
            <div className="hourglassSand" />
            <div className="hourglassSandStream" />
            <div className="hourglassCapBottom" />
          </div>
        </div>
      </div>
    </main>
  );
}
