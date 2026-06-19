import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './useCartStore';

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
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
      voidTransaction: (txId) => set((state) => ({
        transactions: state.transactions.map(t => t.id === txId ? { ...t, status: 'VOID' } : t)
      })),
      clearTransactions: () => set({ transactions: [] })
    }),
    {
      name: 'pos-transaction-storage'
    }
  )
);
