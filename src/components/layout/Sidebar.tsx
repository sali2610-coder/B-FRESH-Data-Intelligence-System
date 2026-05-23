"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 px-3 py-4">
      <div className="mb-4 px-3">
        <div className="flex items-center gap-2">
          <div className="bg-bfresh-blue text-primary-foreground grid size-10 place-items-center rounded-2xl font-black tracking-tight shadow-sm">
            B<span className="text-bfresh-fresh-green">.</span>
          </div>
          <div className="leading-tight">
            <div className="text-base font-extrabold tracking-tight">B-FRESH</div>
            <div className="text-muted-foreground text-[11px]">
              Data Intelligence
            </div>
          </div>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-1">
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
                    : "text-sidebar-foreground hover:bg-sidebar-accent/40",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-bg"
                    className="bg-sidebar-primary absolute inset-0 -z-10 rounded-xl shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="text-muted-foreground border-sidebar-border border-t pt-3 text-center text-[11px]">
        גרסה 0.1 · אב-טיפוס נתוני דמה
      </div>
    </nav>
  );
}
