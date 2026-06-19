import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
}

interface CustomerState {
  customers: Customer[];
  addCustomer: (customerData: Omit<Customer, 'id' | 'points'>) => void;
  updateCustomer: (id: string, customerData: Partial<Omit<Customer, 'id' | 'points'>>) => void;
  deleteCustomer: (id: string) => void;
  addPoints: (id: string, amount: number) => void;
  deductPoints: (id: string, amount: number) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],

      addCustomer: (customerData) => {
        set((state) => ({
          customers: [...state.customers, { ...customerData, id: 'cust_' + Date.now().toString(36), points: 0 }]
        }));
      },

      updateCustomer: (id, customerData) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...customerData } : c))
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id)
        }));
      },

      addPoints: (id, amount) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, points: c.points + amount } : c))
        }));
      },

      deductPoints: (id, amount) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, points: Math.max(0, c.points - amount) } : c))
        }));
      }
    }),
    {
      name: 'pos-customer-storage',
    }
  )
);
