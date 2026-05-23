import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { BottomNav } from "./BottomNav";
import { DensityRoot } from "./DensityRoot";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DensityRoot>
      <div className="relative flex min-h-screen">
        <div className="atmosphere" aria-hidden />
        <aside className="border-sidebar-border/40 bg-sidebar/60 sticky top-0 hidden h-screen w-64 shrink-0 border-s backdrop-blur-2xl lg:flex">
          <Sidebar />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader />
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-4 md:px-6 lg:px-8">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </DensityRoot>
  );
}
