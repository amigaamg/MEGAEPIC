import { create } from 'zustand';

interface UIState {
  themeId: string;
  setThemeId: (id: string) => void;
  phaseIdx: number;
  setPhaseIdx: (idx: number) => void;
  donePhases: string[];
  addDonePhase: (id: string) => void;
  clearDonePhases: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showDoses: boolean;
  setShowDoses: (v: boolean) => void;
  showRef: boolean;
  setShowRef: (v: boolean) => void;
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  themeId: 'light',
  setThemeId: (id) => set({ themeId: id }),
  phaseIdx: 0,
  setPhaseIdx: (idx) => set({ phaseIdx: idx }),
  donePhases: [],
  addDonePhase: (id) => set((state) => ({ donePhases: [...state.donePhases, id] })),
  clearDonePhases: () => set({ donePhases: [] }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  showDoses: false,
  setShowDoses: (v) => set({ showDoses: v }),
  showRef: false,
  setShowRef: (v) => set({ showRef: v }),
  isMobile: false,
  setIsMobile: (v) => set({ isMobile: v }),
}));
