import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({ variant = "primary", className, ...props }: Props) {
  return (
    <button
      className={cn(
        "focus-gold w-full rounded-sm py-3 text-sm font-medium tracking-wide transition-colors disabled:opacity-40",
        variant === "primary" && "bg-gold text-bone hover:bg-gold-light",
        variant === "secondary" && "border border-gold text-gold hover:bg-gold/10",
        variant === "ghost" && "text-bone/70 hover:text-bone",
        className
      )}
      {...props}
    />
  );
}
