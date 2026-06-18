import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Shift {
  id: string;
  cashierId: string;
  startTime: string; // use ISO string
  endTime: string | null;
  startingCash: number;
  expectedEndingCash: number;
  actualEndingCash: number;
  status: 'OPEN' | 'CLOSED' | 'FORCED_CLOSED';
}

interface ShiftState {
  currentShift: Shift | null;
  shiftHistory: Shift[];
  openShift: (cashierId: string, startingCash: number) => void;
  closeShift: (actualEndingCash: number) => void;
  forceCloseShift: (shiftId: string) => void;
  addSalesToShift: (amount: number) => void;
  subtractSalesFromShift: (amount: number) => void;
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      currentShift: null,
      shiftHistory: [],

      openShift: (cashierId: string, startingCash: number) => {
        const newShift: Shift = {
          id: 'shift_' + Date.now().toString(36),
          cashierId,
          startTime: new Date().toISOString(),
          endTime: null,
          startingCash,
          expectedEndingCash: startingCash, // This will be updated by Cart sales
          actualEndingCash: 0,
          status: 'OPEN'
        };
        set({ currentShift: newShift });
      },

      closeShift: (actualEndingCash: number) => {
        set((state) => {
          if (!state.currentShift) return state;
          const closedShift: Shift = {
            ...state.currentShift,
            endTime: new Date().toISOString(),
            actualEndingCash,
            status: 'CLOSED'
          };
          return {
            currentShift: null,
            shiftHistory: [closedShift, ...state.shiftHistory]
          };
        });
      },

      forceCloseShift: (shiftId: string) => {
        set((state) => {
          if (state.currentShift?.id === shiftId) {
            const closedShift: Shift = {
              ...state.currentShift,
              endTime: new Date().toISOString(),
              status: 'FORCED_CLOSED'
            };
            return {
              currentShift: null,
              shiftHistory: [closedShift, ...state.shiftHistory]
            };
          }
          return state;
        });
      },

      addSalesToShift: (amount: number) => {
        set((state) => {
          if (!state.currentShift || state.currentShift.status !== 'OPEN') return state;
          return {
            currentShift: {
              ...state.currentShift,
              expectedEndingCash: state.currentShift.expectedEndingCash + amount
            }
          };
        });
      },

      subtractSalesFromShift: (amount: number) => {
        set((state) => {
          if (!state.currentShift || state.currentShift.status !== 'OPEN') return state;
          return {
            currentShift: {
              ...state.currentShift,
              expectedEndingCash: Math.max(0, state.currentShift.expectedEndingCash - amount)
            }
          };
        });
      }
    }),
    {
      name: 'pos-shift-storage',
    }
  )
);

