import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './useCartStore';

export interface Transaction {
  id: string;
  shiftId: string;
  cashierId: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'TUNAI' | 'QRIS' | null;
  cashGiven?: number; // the amount of cash given, if 'TUNAI'
  timestamp: Date;
  status: 'COMPLETED' | 'VOID';
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  voidTransaction: (txId: string) => void;
  clearTransactions: () => void;
}

// Initial mock data
const mockTransactions: Transaction[] = [
  {
    id: 'tx_1',
    shiftId: 's_1',
    cashierId: 'c_1',
    items: [
      { id: 'i1', product: { id: 'p1', name: 'Ice Americano', categoryId: 'cat_coffee', basePrice: 18000, type: 'SINGLE' }, qty: 1 },
      { id: 'i2', product: { id: 'p5', name: 'Croissant Butter', categoryId: 'cat_snack', basePrice: 20000, type: 'SINGLE' }, qty: 2 }
    ],
    total: 58000,
    paymentMethod: 'TUNAI',
    cashGiven: 100000,
    timestamp: new Date(new Date().setHours(new Date().getHours() - 3)),
    status: 'COMPLETED'
  },
  {
    id: 'tx_2',
    shiftId: 's_1',
    cashierId: 'c_1',
    items: [
       { id: 'i3', product: { id: 'p2', name: 'Aren Latte', categoryId: 'cat_coffee', basePrice: 22000, type: 'SINGLE' }, qty: 3 }
    ],
    total: 66000,
    paymentMethod: 'QRIS',
    timestamp: new Date(new Date().setHours(new Date().getHours() - 1)),
    status: 'COMPLETED'
  }
];

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: mockTransactions,
      addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
      voidTransaction: (txId) => set((state) => ({
        transactions: state.transactions.map(t => t.id === txId ? { ...t, status: 'VOID' } : t)
      })),
      clearTransactions: () => set({ transactions: [] })
    }),
    {
      name: 'pos-transaction-storage',
    }
  )
);
