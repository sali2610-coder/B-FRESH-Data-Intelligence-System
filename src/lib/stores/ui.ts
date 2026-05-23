"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Density = "comfortable" | "compact";

type UIState = {
  density: Density;
  setDensity: (d: Density) => void;
  toggleDensity: () => void;
};

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      density: "comfortable",
      setDensity: (density) => set({ density }),
      toggleDensity: () =>
        set({
          density: get().density === "comfortable" ? "compact" : "comfortable",
        }),
    }),
    { name: "bfresh-ui" },
  ),
);
