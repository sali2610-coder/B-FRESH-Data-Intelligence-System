"use client";

import { useState } from "react";
import { Menu, Search, RefreshCw, Wifi } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "./Sidebar";
import { LiveClock } from "./LiveClock";

const BOARDS = [
  { id: "ops", label: "תפעול ראשי" },
  { id: "service", label: "שירות לקוחות" },
  { id: "marketing", label: "שיווק" },
  { id: "finance", label: "הנהלת חשבונות" },
];

export function TopHeader() {
  const qc = useQueryClient();
  const [board, setBoard] = useState("ops");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleRefresh = async () => {
    await qc.invalidateQueries();
    toast.success("הנתונים רועננו");
  };

  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/60 border-border sticky top-0 z-30 border-b backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
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

        <div className="relative hidden flex-1 items-center md:flex">
          <Search className="text-muted-foreground pointer-events-none absolute right-3 size-4" />
          <Input
            type="search"
            placeholder="חיפוש משימה, עובד, סניף…"
            className="bg-muted/40 h-10 rounded-xl border-transparent ps-3 pe-9"
          />
        </div>

        <div className="ms-auto flex items-center gap-2 md:gap-3">
          <Select value={board} onValueChange={(v) => v && setBoard(v)}>
            <SelectTrigger className="hidden h-10 w-44 rounded-xl md:flex">
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

          <Badge
            variant="outline"
            className="border-bfresh-fresh-green/40 text-bfresh-fresh-green hidden gap-1.5 rounded-full py-1.5 md:flex"
          >
            <span className="bg-bfresh-fresh-green inline-block size-2 animate-pulse rounded-full" />
            <Wifi className="size-3.5" />
            מחובר · דמה
          </Badge>

          <LiveClock />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            aria-label="רענון"
            className="rounded-xl"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
