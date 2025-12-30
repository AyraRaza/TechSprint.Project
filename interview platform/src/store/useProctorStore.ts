import { create } from 'zustand';

export type Violation = {
  id: string;
  type: 'no-face' | 'multiple-faces' | 'look-away' | 'face-offscreen' | 'camera-covered';
  timestamp: number;
  message?: string;
};

type ProctorState = {
  enabled: boolean;
  warnings: number;
  violations: Violation[];
  lastWarningAt?: number;
  status: 'idle' | 'initializing' | 'ready' | 'error';
  mode: 'none' | 'reduced' | 'full';
  start: () => void;
  stop: () => void;
  setStatus: (status: ProctorState['status']) => void;
  addViolation: (v: Violation) => void;
  addWarning: () => void;
  reset: () => void;
};

export const useProctorStore = create<ProctorState>((set, get) => ({
  enabled: false,
  warnings: 0,
  violations: [],
  lastWarningAt: undefined,
  status: 'idle',
  mode: 'none',
  start: () => set({ enabled: true }),
  stop: () => set({ enabled: false }),
  setStatus: (status) => set({ status }),
  addViolation: (v: Violation) => set((s) => ({ violations: [...s.violations, v] })),
  addWarning: () => set((s) => ({ warnings: s.warnings + 1, lastWarningAt: Date.now() })),
  reset: () => set({ enabled: false, warnings: 0, violations: [], lastWarningAt: undefined }),
}));

export default useProctorStore;
