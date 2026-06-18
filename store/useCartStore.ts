import { create } from 'zustand';
import { Product } from './useInventoryStore';

export interface CartItem {
  id: string; // unique for each line item (in case of specific notes later)
  product: Product;
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  // Computed
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (product) => {
    set((state) => {
      const existing = state.items.find(i => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map(i => 
             i.id === existing.id ? { ...i, qty: i.qty + 1 } : i
          )
        };
      }
      return {
        items: [...state.items, { id: Math.random().toString(36).substr(2, 9), product, qty: 1 }]
      };
    });
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter(i => i.id !== id) }));
  },

  updateQty: (id, qty) => {
    set((state) => {
      if (qty <= 0) {
         return { items: state.items.filter(i => i.id !== id) };
      }
      return {
        items: state.items.map(i => i.id === id ? { ...i, qty } : i)
      };
    });
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.product.basePrice * item.qty), 0);
  }

}));
