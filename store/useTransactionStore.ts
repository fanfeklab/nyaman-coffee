import { create } from 'zustand';
import { CartItem } from './useCartStore';

export interface Transaction {
  id: string;
  shiftId: string;
  cashierId: string;
  timestamp: Date;
  items: CartItem[];
  subtotal: number;
  paymentMethod: 'CASH' | 'QRIS' | 'SPLIT';
  status: 'COMPLETED' | 'VOID';
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => void;
  voidTransaction: (id: string) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  // Mock data for analytics
  transactions: [
    {
      id: 'tx_1',
      shiftId: 'shift_1',
      cashierId: 'kasir_1',
      timestamp: new Date(Date.now() - 86400000 * 2),
      items: [],
      subtotal: 150000,
      paymentMethod: 'CASH',
      status: 'COMPLETED'
    },
    {
      id: 'tx_2',
      shiftId: 'shift_2',
      cashierId: 'kasir_1',
      timestamp: new Date(Date.now() - 86400000),
      items: [],
      subtotal: 300000,
      paymentMethod: 'QRIS',
      status: 'COMPLETED'
    },
    {
      id: 'tx_3',
      shiftId: 'shift_2',
      cashierId: 'kasir_2',
      timestamp: new Date(Date.now() - 86400000),
      items: [],
      subtotal: 120000,
      paymentMethod: 'CASH',
      status: 'VOID'
    }
  ],
  
  addTransaction: (tx) => set((state) => ({
    transactions: [
      {
        ...tx,
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        status: 'COMPLETED'
      },
      ...state.transactions
    ]
  })),

  voidTransaction: (id) => set((state) => ({
    transactions: state.transactions.map(t => 
      t.id === id ? { ...t, status: 'VOID' } : t
    )
  }))
}));
