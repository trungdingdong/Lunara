import { create } from "zustand";

interface SpreadDraftState {
  spreadId: string;
  setSpreadId: (spreadId: string) => void;
}

export const DEFAULT_SPREAD_ID = "three-card";

export const useSpreadDraftStore = create<SpreadDraftState>((set) => ({
  spreadId: DEFAULT_SPREAD_ID,
  setSpreadId: (spreadId) => set({ spreadId }),
}));
