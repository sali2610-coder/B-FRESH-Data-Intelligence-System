"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  Search,
  RefreshCw,
  Wifi,
  Bell,
  Command as CommandIcon,
  Sparkles,
} from "lucide-react";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { LiveClock } from "./LiveClock";
import { DensityToggle } from "./DensityToggle";
import { SPRING_BOUNCE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const BOARDS = [
  { id: "ops", label: "תפעול ראשי" },
  { id: "service", label: "שירות לקוחות" },
  { id: "marketing", label: "שיווק" },
  { id: "finance", label: "הנהלת חשבונות" },
];

export function TopHeader() {
  const qc = useQueryClient();
  const fetching = useIsFetching();
  const [board, setBoard] = useState("ops");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K to open command palette (visual only for now)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleRefresh = async () => {
    await qc.invalidateQueries();
    toast.success("הנתונים רועננו", {
      description: `${new Date().toLocaleTimeString("he-IL")}`,
    });
  };

  return (
    <>
      <header className="bg-background/55 supports-[backdrop-filter]:bg-background/40 border-border/50 sticky top-0 z-30 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 md:px-6 lg:px-8">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden" />
              }
            >
              <Menu className="size-5" />
              <span className="sr-only">פתח תפריט</span>
            </SheetTrigger>
            <SheetContent side="right" className="bg-sidebar w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>תפריט ניווט</SheetTitle>
              </SheetHeader>
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Mobile compact brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="from-bfresh-blue to-bfresh-fresh-green grid size-8 place-items-center rounded-xl bg-gradient-to-br text-sm font-black text-white shadow-md shadow-bfresh-blue/25">
              B
            </div>
            <span className="text-sm font-extrabold tracking-tight">
              B-FRESH
            </span>
          </div>

          {/* Search · command-palette trigger */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "group relative hidden h-10 flex-1 items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 text-start text-muted-foreground transition-all md:flex",
              "hover:border-bfresh-blue/30 hover:bg-card hover:text-foreground hover:shadow-sm",
            )}
          >
            <Search className="size-4 opacity-70" />
            <span className="text-[13px]">חיפוש משימה, עובד, סניף…</span>
            <div className="ms-auto flex items-center gap-1">
              <kbd className="border-border bg-background text-muted-foreground inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-mono font-bold">
                <CommandIcon className="size-2.5" />K
              </kbd>
            </div>
          </button>

          {/* Right cluster */}
          <div className="ms-auto flex items-center gap-1.5 md:gap-2.5">
            <Select value={board} onValueChange={(v) => v && setBoard(v)}>
              <SelectTrigger className="bg-muted/30 hover:bg-card hidden h-10 w-44 rounded-xl border-border/60 transition-colors md:flex">
                <SelectValue placeholder="בחר לוח" />
              </SelectTrigger>
              <SelectContent>
                {BOARDS.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="hidden md:block">
              <DensityToggle />
            </div>

            <div className="hidden items-center gap-1.5 rounded-full bg-gradient-to-l from-emerald-500/10 to-bfresh-fresh-green/10 px-3 py-1.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-500/20 md:flex">
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
              </span>
              <Wifi className="size-3" />
              מחובר · דמה
            </div>

            <LiveClock />

            <Button
              variant="ghost"
              size="icon"
              aria-label="התראות"
              className="relative rounded-xl"
            >
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-background" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              aria-label="רענון"
              className="rounded-xl"
            >
              <motion.div
                animate={{ rotate: fetching > 0 ? 360 : 0 }}
                transition={
                  fetching > 0
                    ? { repeat: Infinity, duration: 1.1, ease: "linear" }
                    : SPRING_BOUNCE
                }
              >
                <RefreshCw className="size-4" />
              </motion.div>
            </Button>
          </div>
        </div>
      </header>

      {/* Command palette mock — visual command-palette vibe */}
      {paletteOpen && (
        <button
          type="button"
          onClick={() => setPaletteOpen(false)}
          aria-label="סגירת חיפוש"
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={SPRING_BOUNCE}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-[12vh] w-full max-w-xl px-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="premium-card elev-2 overflow-hidden p-0 text-start">
              <div className="border-border/60 flex items-center gap-3 border-b px-4 py-3">
                <Search className="text-muted-foreground size-4" />
                <input
                  autoFocus
                  type="text"
                  placeholder="חפש פעולה, משימה, עובד או סניף…"
                  className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm font-medium outline-none"
                />
                <kbd className="border-border bg-muted text-muted-foreground inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-mono font-bold">
                  ESC
                </kbd>
              </div>
              <div className="px-3 py-3">
                <div className="text-muted-foreground mb-2 px-2 text-[10px] font-bold uppercase tracking-wider">
                  הצעות
                </div>
                <ul className="flex flex-col gap-1 text-sm">
                  {[
                    "פתח את כל המשימות בחריגת SLA",
                    "סקירת ביצועי תל אביב מרכז",
                    "השוואת עובדים השבוע",
                    "תובנות AI · מגמת שבוע",
                  ].map((item) => (
                    <li
                      key={item}
                      className="hover:bg-accent/50 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
                    >
                      <Sparkles className="text-bfresh-blue size-3.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-border/60 text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 text-[10.5px]">
                <span>Beta · חיפוש דמו</span>
                <span className="flex items-center gap-2">
                  <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono font-bold">
                    ↵
                  </kbd>
                  לפתוח
                </span>
              </div>
            </div>
          </motion.div>
        </button>
      )}
    </>
  );
}
