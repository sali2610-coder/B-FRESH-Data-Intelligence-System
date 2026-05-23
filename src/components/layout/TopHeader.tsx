"use client";

import { useState } from "react";
import { Menu, Search, RefreshCw, Wifi, Bell } from "lucide-react";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const handleRefresh = async () => {
    await qc.invalidateQueries();
    toast.success("הנתונים רועננו");
  };

  return (
    <header className="bg-background/60 supports-[backdrop-filter]:bg-background/45 border-border/60 sticky top-0 z-30 border-b backdrop-blur-xl">
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
          <div className="from-bfresh-blue to-bfresh-fresh-green grid size-8 place-items-center rounded-xl bg-gradient-to-br text-white text-sm font-black">
            B
          </div>
          <span className="text-sm font-extrabold tracking-tight">B-FRESH</span>
        </div>

        {/* Search */}
        <div className="relative hidden flex-1 items-center md:flex">
          <Search className="text-muted-foreground pointer-events-none absolute right-3 size-4" />
          <Input
            type="search"
            placeholder="חיפוש משימה, עובד, סניף, מספר פריט…"
            className="bg-muted/40 focus:bg-card focus:ring-bfresh-blue/30 h-10 rounded-xl border-transparent ps-3 pe-9 transition-all focus:ring-2"
          />
          <kbd className="text-muted-foreground bg-background border-border absolute start-2.5 hidden rounded border px-1.5 py-0.5 text-[10px] font-mono md:block">
            ⌘K
          </kbd>
        </div>

        {/* Right cluster */}
        <div className="ms-auto flex items-center gap-1.5 md:gap-2.5">
          <Select value={board} onValueChange={(v) => v && setBoard(v)}>
            <SelectTrigger className="bg-muted/40 hidden h-10 w-44 rounded-xl border-transparent md:flex">
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

          <div className="bg-bfresh-fresh-green/10 text-bfresh-fresh-green hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold md:flex">
            <span className="bg-bfresh-fresh-green relative inline-flex size-2 rounded-full">
              <span className="bg-bfresh-fresh-green absolute inset-0 animate-ping rounded-full opacity-75" />
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
            <span className="bg-rose-500 absolute right-2 top-2 size-2 rounded-full" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            aria-label="רענון"
            className="rounded-xl"
          >
            <RefreshCw
              className={cn("size-4", fetching > 0 && "animate-spin")}
            />
          </Button>
        </div>
      </div>
    </header>
  );
}
