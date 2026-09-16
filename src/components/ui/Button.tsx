import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-night text-ivory hover:bg-gold hover:text-night border border-night hover:border-gold",
    secondary: "bg-gold text-night hover:bg-gold-light border border-gold",
    outline: "bg-transparent text-night border border-stone-dark/40 hover:border-night hover:bg-ivory",
    ghost: "bg-transparent text-night hover:text-gold hover:bg-ivory/60",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 font-mono uppercase tracking-wider",
    md: "text-sm px-4 py-2 font-mono uppercase tracking-wider",
    lg: "text-base px-6 py-3 font-mono uppercase tracking-wider",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
