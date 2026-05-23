"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LifeBuoy, Settings, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";
import { SPRING_BOUNCE, SPRING_SMOOTH } from "@/lib/motion";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="relative flex h-full w-full flex-col gap-1 px-3 py-5">
      {/* Inner depth gradient */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5"
      />

      {/* Brand */}
      <div className="relative mb-5 px-2.5">
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING_BOUNCE}
            className="relative"
          >
            <div className="from-bfresh-blue to-bfresh-fresh-green grid size-11 place-items-center rounded-2xl bg-gradient-to-br text-white font-black tracking-tight shadow-lg shadow-bfresh-blue/30 ring-1 ring-white/40">
              B
            </div>
            <span className="bg-bfresh-fresh-green ring-sidebar absolute -bottom-0.5 -end-0.5 size-3 rounded-full ring-2" />
          </motion.div>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight">
              B-FRESH
            </div>
            <div className="text-muted-foreground text-[10.5px] font-bold tracking-widest">
              DATA INTELLIGENCE
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted-foreground/70 relative px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider">
        ניווט
      </div>

      <ul className="relative flex flex-col gap-0.5">
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
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/25",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-bg"
                    className="from-bfresh-blue to-bfresh-fresh-green shadow-bfresh-blue/30 absolute inset-0 -z-10 rounded-xl bg-gradient-to-l shadow-md ring-1 ring-white/30"
                    transition={SPRING_SMOOTH}
                  />
                )}
                <motion.span
                  whileHover={active ? undefined : { rotate: -6, scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={SPRING_BOUNCE}
                  className="shrink-0"
                >
                  <Icon className="size-[18px]" />
                </motion.span>
                <span className="flex-1 truncate">{item.label}</span>
                {active ? (
                  <span className="size-1.5 rounded-full bg-white/85" />
                ) : (
                  <ChevronLeft className="size-3.5 opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-50" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="relative mt-auto">
        <div className="text-muted-foreground/70 px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-wider">
          מערכת
        </div>
        <ul className="flex flex-col gap-0.5">
          <li>
            <button
              type="button"
              className="text-sidebar-foreground/75 hover:bg-sidebar-accent/25 hover:text-sidebar-foreground flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
            >
              <Settings className="size-[18px]" />
              הגדרות
            </button>
          </li>
          <li>
            <button
              type="button"
              className="text-sidebar-foreground/75 hover:bg-sidebar-accent/25 hover:text-sidebar-foreground flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
            >
              <LifeBuoy className="size-[18px]" />
              עזרה ותמיכה
            </button>
          </li>
        </ul>

        <div className="from-bfresh-blue/12 to-bfresh-fresh-green/12 ring-bfresh-blue/15 mt-4 overflow-hidden rounded-2xl bg-gradient-to-bl p-3.5 text-[11px] ring-1">
          <div className="flex items-center gap-2">
            <span className="bg-bfresh-blue inline-flex size-2 rounded-full">
              <span className="bg-bfresh-blue absolute -m-0 animate-ping opacity-60 size-2 rounded-full" />
            </span>
            <div className="text-foreground font-extrabold">גרסה 0.1 · BETA</div>
          </div>
          <p className="text-muted-foreground mt-1 leading-snug">
            נתוני דמה לצורכי הדגמה. חיבור Monday API ייכנס בפאזה 3.
          </p>
        </div>
      </div>
    </nav>
  );
}
