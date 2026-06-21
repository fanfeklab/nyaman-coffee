import { idbStorage } from '@/lib/idbStorage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from './useCartStore';
import { useSyncQueueStore } from './useSyncQueueStore';

export interface Transaction {
  id: string;
  shiftId: string;
  cashierId: string;
  customerId?: string;
  customerName?: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'TUNAI' | 'QRIS' | null;
  cashGiven?: number;
  timestamp: Date;
  status: 'COMPLETED' | 'VOID';
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  voidTransaction: (txId: string) => void;
  deleteTransaction?: (txId: string) => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) => {
        useSyncQueueStore.getState().enqueueMutation('NEW_TRANSACTION', { transaction: tx, items: tx.items });
        set((state) => ({ transactions: [tx, ...state.transactions] }));
      },
      voidTransaction: (txId) => set((state) => {
        const nextTx = state.transactions.map(t => t.id === txId ? { ...t, status: 'VOID' } as Transaction : t);
        const updated = nextTx.find(t => t.id === txId);
        if (updated) {
          useSyncQueueStore.getState().enqueueMutation('VOID_TRANSACTION', { transactionId: txId });
        }
        return { transactions: nextTx };
      }),
      deleteTransaction: (txId) => {
        useSyncQueueStore.getState().enqueueMutation('DELETE_TRANSACTION', { transactionId: txId });
        set((state) => ({ transactions: state.transactions.filter(t => t.id !== txId) }));
      },
      clearTransactions: () => set({ transactions: [] })
    }),
    {
      name: 'pos-transaction-storage',
  storage: createJSONStorage(() => idbStorage)
    }
  )
);
