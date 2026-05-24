"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedView = {
  id: string;
  name: string;
  scope: string; // "complaints" / "branches" / etc.
  filters: Record<string, string | undefined>;
  createdAt: string;
};

type SavedViewsState = {
  views: SavedView[];
  add(view: Omit<SavedView, "id" | "createdAt">): SavedView;
  remove(id: string): void;
  byScope(scope: string): SavedView[];
};

export const useSavedViews = create<SavedViewsState>()(
  persist(
    (set, get) => ({
      views: [],
      add(view) {
        const created: SavedView = {
          ...view,
          id: `sv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
        };
        set({ views: [...get().views, created] });
        return created;
      },
      remove(id) {
        set({ views: get().views.filter((v) => v.id !== id) });
      },
      byScope(scope) {
        return get().views.filter((v) => v.scope === scope);
      },
    }),
    { name: "bfresh-saved-views" },
  ),
);
