import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './useCartStore';
import { upsertFirebaseTransaction, deleteFirebaseTransaction } from '@/lib/firebase/services';

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
        upsertFirebaseTransaction(tx);
        set((state) => ({ transactions: [tx, ...state.transactions] }));
      },
      voidTransaction: (txId) => set((state) => {
        const nextTx = state.transactions.map(t => t.id === txId ? { ...t, status: 'VOID' } as Transaction : t);
        const updated = nextTx.find(t => t.id === txId);
        if (updated) upsertFirebaseTransaction(updated);
        return { transactions: nextTx };
      }),
      deleteTransaction: (txId) => {
        deleteFirebaseTransaction(txId);
        set((state) => ({ transactions: state.transactions.filter(t => t.id !== txId) }));
      },
      clearTransactions: () => set({ transactions: [] })
    }),
    {
      name: 'pos-transaction-storage'
    }
  )
);
