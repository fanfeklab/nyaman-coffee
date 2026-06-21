import { idbStorage } from '@/lib/idbStorage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { upsertFirebaseShift, upsertFirebasePettyCash } from '@/lib/firebase/services';

export interface PettyCashTransaction {
  id: string;
  shiftId: string;
  cashierId: string;
  amount: number;
  type: 'IN' | 'OUT';
  note: string;
  timestamp: string;
}

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
  pettyCashHistory: PettyCashTransaction[];
  openShift: (cashierId: string, startingCash: number) => void;
  closeShift: (actualEndingCash: number) => void;
  acknowledgeClosedShift: () => void;
  forceCloseShift: (shiftId: string) => void;
  addSalesToShift: (amount: number) => void;
  subtractSalesFromShift: (amount: number) => void;
  addPettyCash: (cashierId: string, amount: number, type: 'IN' | 'OUT', note: string) => void;
  clearShiftHistory: () => void;
}

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      currentShift: null,
      shiftHistory: [],
      pettyCashHistory: [],

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
        upsertFirebaseShift(newShift);
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
          upsertFirebaseShift(closedShift);
          return {
            currentShift: closedShift,
            shiftHistory: [closedShift, ...state.shiftHistory]
          };
        });
      },

      acknowledgeClosedShift: () => {
         set({ currentShift: null });
      },

      forceCloseShift: (shiftId: string) => {
        set((state) => {
          if (state.currentShift?.id === shiftId) {
            const closedShift: Shift = {
              ...state.currentShift,
              endTime: new Date().toISOString(),
              status: 'FORCED_CLOSED'
            };
            upsertFirebaseShift(closedShift);
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
          const updatedShift = {
            ...state.currentShift,
            expectedEndingCash: state.currentShift.expectedEndingCash + amount
          };
          upsertFirebaseShift(updatedShift);
          return {
            currentShift: updatedShift
          };
        });
      },

      subtractSalesFromShift: (amount: number) => {
        set((state) => {
          if (!state.currentShift || state.currentShift.status !== 'OPEN') return state;
          const updatedShift = {
            ...state.currentShift,
            expectedEndingCash: Math.max(0, state.currentShift.expectedEndingCash - amount)
          };
          upsertFirebaseShift(updatedShift);
          return {
            currentShift: updatedShift
          };
        });
      },

      addPettyCash: (cashierId: string, amount: number, type: 'IN' | 'OUT', note: string) => {
        set((state) => {
          if (!state.currentShift || state.currentShift.status !== 'OPEN') return state;
          
          const newTx: PettyCashTransaction = {
            id: 'pc_' + Date.now().toString(36),
            shiftId: state.currentShift.id,
            cashierId,
            amount,
            type,
            note,
            timestamp: new Date().toISOString()
          };

          upsertFirebasePettyCash(newTx);

          const updatedShift = {
            ...state.currentShift,
            expectedEndingCash: type === 'IN' 
              ? state.currentShift.expectedEndingCash + amount 
              : Math.max(0, state.currentShift.expectedEndingCash - amount)
          };

          upsertFirebaseShift(updatedShift);

          return {
            pettyCashHistory: [newTx, ...state.pettyCashHistory],
            currentShift: updatedShift
          };
        });
      },

      clearShiftHistory: () => {
        set({ currentShift: null, shiftHistory: [], pettyCashHistory: [] });
      }
    }),
    {
      name: 'pos-shift-storage',
  storage: createJSONStorage(() => idbStorage),
    }
  )
);

