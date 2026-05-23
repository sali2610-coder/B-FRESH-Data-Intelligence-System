"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Sparkles,
  Activity,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_SMOOTH } from "@/lib/motion";

type Tab = { href: string; label: string; icon: LucideIcon; match?: (p: string) => boolean };

const TABS: Tab[] = [
  { href: "/", label: "מרכז", icon: LayoutDashboard, match: (p) => p === "/" },
  {
    href: "/branches",
    label: "סניפים",
    icon: Building2,
    match: (p) => p.startsWith("/branches"),
  },
  {
    href: "/insights",
    label: "AI",
    icon: Sparkles,
    match: (p) => p.startsWith("/insights"),
  },
  {
    href: "/sla",
    label: "SLA",
    icon: Activity,
    match: (p) => p.startsWith("/sla"),
  },
  {
    href: "/forms",
    label: "עוד",
    icon: MoreHorizontal,
    match: (p) => p.startsWith("/forms") || p.startsWith("/employees"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="ניווט תחתון"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 lg:hidden",
        "border-t border-border/50",
        "bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-[600px] grid-cols-5 px-2 py-1.5">
        {TABS.map((t) => {
          const active = t.match
            ? t.match(pathname)
            : pathname === t.href;
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-bold transition-colors",
                  active
                    ? "text-bfresh-blue"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    transition={SPRING_SMOOTH}
                    className="bg-bfresh-blue/12 absolute inset-x-2 inset-y-1 -z-10 rounded-xl"
                  />
                )}
                <Icon className="size-[18px]" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
