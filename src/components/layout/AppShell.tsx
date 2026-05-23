import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      <div className="atmosphere" aria-hidden />
      <aside className="border-sidebar-border/60 bg-sidebar/70 sticky top-0 hidden h-screen w-64 shrink-0 border-s backdrop-blur-xl lg:flex">
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-12 pt-4 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
