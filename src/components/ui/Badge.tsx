import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "night" | "blue" | "stone" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "gold",
  size = "sm",
  className,
  ...props
}: BadgeProps) {
  const variantStyles = {
    gold: "bg-gold/15 text-gold-dark border-gold/30 font-medium",
    night: "bg-night text-ivory border-night",
    blue: "bg-blue-tile/20 text-blue-deep border-blue-tile/40",
    stone: "bg-stone/50 text-stone-dark border-stone",
    outline: "bg-transparent text-stone-dark border-stone hover:border-gold hover:text-night",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2.5 py-0.5 tracking-wider uppercase",
    md: "text-xs px-3 py-1 tracking-wider uppercase",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono border transition-colors rounded-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
