"use client";

type TooltipProps = {
  text: string;
};

export default function Tooltip({ text }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="More information"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-bone/40 text-[10px] text-bone/60"
      >
        ?
      </button>

      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-56 -translate-x-1/2 rounded-sm border border-hairline bg-charcoal px-3 py-2 text-[11px] leading-relaxed text-bone shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}