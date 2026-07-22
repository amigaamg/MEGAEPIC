// ═══════════════════════════════════════════════════════════════════════════════
// UI-ONLY Zustand store. Phase tracking removed — use EncounterState.workflow.
// ═══════════════════════════════════════════════════════════════════════════════
// This store now contains ONLY UI presentation state (theme, sidebar, toggles).
// Clinical workflow progression lives in EncounterState.workflow.
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';

interface UIState {
  themeId: string;
  setThemeId: (id: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  showDoses: boolean;
  setShowDoses: (v: boolean) => void;
  showRef: boolean;
  setShowRef: (v: boolean) => void;
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;
  phaseIdx: number;
  setPhaseIdx: (n: number) => void;
  donePhases: string[];
  addDonePhase: (id: string) => void;
}

type Selector<T, U> = (state: T) => U;

// Create store without the curried syntax to avoid zustand v5 TS issues
const storeApi = create<UIState>()((set) => ({
  themeId: 'light',
  setThemeId: (id) => set({ themeId: id }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  showDoses: false,
  setShowDoses: (v) => set({ showDoses: v }),
  showRef: false,
  setShowRef: (v) => set({ showRef: v }),
  isMobile: false,
  setIsMobile: (v) => set({ isMobile: v }),
  phaseIdx: 0,
  setPhaseIdx: (n) => set({ phaseIdx: n }),
  donePhases: [],
  addDonePhase: (id) => set((s) => ({ donePhases: [...s.donePhases, id] })),
}));

type UIStoreHook = {
  (): UIState;
  <U>(selector: Selector<UIState, U>): U;
  getState(): UIState;
};

const useUIStore = ((selector?: Selector<UIState, any>): UIState | any =>
  selector ? storeApi(selector) : storeApi()) as UIStoreHook;
useUIStore.getState = storeApi.getState.bind(storeApi);

export { useUIStore };
