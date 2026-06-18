import { create } from 'zustand';

export interface Shift {
  id: string;
  cashierId: string;
  startTime: Date;
  endTime: Date | null;
  startingCash: number;
  expectedEndingCash: number;
  actualEndingCash: number;
  status: 'OPEN' | 'CLOSED' | 'FORCED_CLOSED';
}

interface ShiftState {
  currentShift: Shift | null;
  openShift: (cashierId: string, startingCash: number) => void;
  closeShift: (actualEndingCash: number) => void;
  forceCloseShift: (shiftId: string) => void;
  addSalesToShift: (amount: number) => void;
  deductSalesFromShift: (amount: number) => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  currentShift: null,

  openShift: (cashierId: string, startingCash: number) => {
    const newShift: Shift = {
      id: Math.random().toString(36).substring(7),
      cashierId,
      startTime: new Date(),
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
      return {
        currentShift: {
          ...state.currentShift,
          endTime: new Date(),
          actualEndingCash,
          status: 'CLOSED'
        }
      };
    });
  },

  forceCloseShift: (shiftId: string) => {
    set((state) => {
      if (state.currentShift?.id === shiftId) {
        return {
          currentShift: {
            ...state.currentShift,
            endTime: new Date(),
            status: 'FORCED_CLOSED'
          }
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

  deductSalesFromShift: (amount: number) => {
    set((state) => {
      if (!state.currentShift || state.currentShift.status !== 'OPEN') return state;
      return {
        currentShift: {
          ...state.currentShift,
          expectedEndingCash: Math.max(state.currentShift.startingCash, state.currentShift.expectedEndingCash - amount)
        }
      };
    });
  }
}));
