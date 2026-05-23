"use client";

import { create } from "zustand";

export type DateRange = "7d" | "30d" | "90d" | "ytd";

export type FilterState = {
  dateRange: DateRange;
  branchId: string | "all";
  employeeId: string | "all";
  status: "all" | "open" | "in_progress" | "blocked" | "done";
  slaState: "all" | "ok" | "at_risk" | "breached";
  setDateRange: (v: DateRange) => void;
  setBranchId: (v: string) => void;
  setEmployeeId: (v: string) => void;
  setStatus: (v: FilterState["status"]) => void;
  setSlaState: (v: FilterState["slaState"]) => void;
  reset: () => void;
};

const initial: Omit<
  FilterState,
  "setDateRange" | "setBranchId" | "setEmployeeId" | "setStatus" | "setSlaState" | "reset"
> = {
  dateRange: "30d",
  branchId: "all",
  employeeId: "all",
  status: "all",
  slaState: "all",
};

export const useFilters = create<FilterState>((set) => ({
  ...initial,
  setDateRange: (dateRange) => set({ dateRange }),
  setBranchId: (branchId) => set({ branchId }),
  setEmployeeId: (employeeId) => set({ employeeId }),
  setStatus: (status) => set({ status }),
  setSlaState: (slaState) => set({ slaState }),
  reset: () => set(initial),
}));
