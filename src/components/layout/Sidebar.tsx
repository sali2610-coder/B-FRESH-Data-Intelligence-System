"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LifeBuoy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-full flex-col gap-1 px-3 py-5">
      {/* Brand */}
      <div className="mb-5 px-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="from-bfresh-blue to-bfresh-fresh-green grid size-11 place-items-center rounded-2xl bg-gradient-to-br text-white font-black tracking-tight shadow-lg shadow-bfresh-blue/25">
              B
            </div>
            <span className="bg-bfresh-fresh-green absolute -bottom-0.5 -end-0.5 size-3 rounded-full ring-2 ring-sidebar" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight">
              B-FRESH
            </div>
            <div className="text-muted-foreground text-[10.5px] font-medium tracking-wide">
              DATA INTELLIGENCE
            </div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="text-muted-foreground/70 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider">
        ניווט
      </div>

      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/85 hover:text-sidebar-foreground hover:bg-sidebar-accent/30",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-bg"
                    className="from-bfresh-blue to-bfresh-fresh-green shadow-bfresh-blue/25 absolute inset-0 -z-10 rounded-xl bg-gradient-to-l shadow-md"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={cn(
                    "size-[18px] shrink-0 transition-transform",
                    active ? "" : "group-hover:scale-110",
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {active && (
                  <span className="size-1.5 rounded-full bg-white/80" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <div className="text-muted-foreground/70 px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wider">
          מערכת
        </div>
        <ul className="flex flex-col gap-0.5">
          <li>
            <button
              type="button"
              className="text-sidebar-foreground/75 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <Settings className="size-[18px]" />
              הגדרות
            </button>
          </li>
          <li>
            <button
              type="button"
              className="text-sidebar-foreground/75 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <LifeBuoy className="size-[18px]" />
              עזרה ותמיכה
            </button>
          </li>
        </ul>

        <div className="mt-4 rounded-xl bg-gradient-to-bl from-bfresh-blue/10 to-bfresh-fresh-green/10 p-3 text-[11px]">
          <div className="text-foreground mb-0.5 font-bold">גרסה 0.1 · BETA</div>
          <p className="text-muted-foreground leading-snug">
            נתוני דמה לצורכי הדגמה. חיבור Monday API ייכנס בפאזה 3.
          </p>
        </div>
      </div>
    </nav>
  );
}
