import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-2 text-xs font-mono text-stone-dark", className)}
    >
      <Link href="/" className="hover:text-gold transition-colors">
        Início
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-stone-dark/50 shrink-0" />
            {isLast || !item.href ? (
              <span className="text-night font-medium truncate max-w-[240px] md:max-w-none">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-gold transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
