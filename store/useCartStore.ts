import { create } from 'zustand';
import { Product } from './useInventoryStore';
import { useSettingsStore } from './useSettingsStore';

export interface CartItem {
  id: string; // unique for each line item (in case of specific notes later)
  product: Product;
  qty: number;
}

export interface SavedBill {
  id: string;
  name: string;
  items: CartItem[];
  timestamp: Date;
  discountType: 'PERCENTAGE' | 'NOMINAL' | null;
  discountValue: number;
}

interface CartState {
  items: CartItem[];
  discountType: 'PERCENTAGE' | 'NOMINAL' | null;
  discountValue: number;
  taxRate: number;
  serviceChargeRate: number;
  savedBills: SavedBill[];

  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  
  setDiscount: (type: 'PERCENTAGE' | 'NOMINAL' | null, value: number) => void;
  setTaxRate: (rate: number) => void;
  setServiceChargeRate: (rate: number) => void;

  saveBill: (name: string) => void;
  loadBill: (id: string) => void;
  deleteSavedBill: (id: string) => void;

  // Computed
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: () => number;
  getServiceChargeAmount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discountType: null,
  discountValue: 0,
  taxRate: 11, // Default PPN 11%
  serviceChargeRate: 0,
  savedBills: [],
  
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
        items: [...state.items, { id: 'cart_' + Date.now().toString(36), product, qty: 1 }]
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

  setDiscount: (type, value) => {
    set({ discountType: type, discountValue: value });
  },

  setTaxRate: (rate) => set({ taxRate: rate }),
  setServiceChargeRate: (rate) => set({ serviceChargeRate: rate }),

  clearCart: () => {
    const settings = useSettingsStore.getState();
    set({ 
      items: [], 
      discountType: null, 
      discountValue: 0,
      taxRate: settings.taxRate,
      serviceChargeRate: settings.serviceChargeRate
    });
  },

  saveBill: (name) => {
    const { items, discountType, discountValue } = get();
    if (items.length === 0) return;
    
    const newBill: SavedBill = {
      id: 'bill_' + Date.now().toString(36),
      name,
      items: [...items],
      timestamp: new Date(),
      discountType,
      discountValue
    };

    set((state) => ({
      savedBills: [...state.savedBills, newBill],
      items: [],
      discountType: null,
      discountValue: 0
    }));
  },

  loadBill: (id) => {
    set((state) => {
      const bill = state.savedBills.find(b => b.id === id);
      if (!bill) return state;

      return {
        items: bill.items,
        discountType: bill.discountType,
        discountValue: bill.discountValue,
        savedBills: state.savedBills.filter(b => b.id !== id)
      };
    });
  },

  deleteSavedBill: (id) => {
    set((state) => ({
      savedBills: state.savedBills.filter(b => b.id !== id)
    }));
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + (item.product.basePrice * item.qty), 0);
  },

  getDiscountAmount: () => {
    const { getSubtotal, discountType, discountValue } = get();
    const subtotal = getSubtotal();
    if (discountType === 'NOMINAL') return discountValue;
    if (discountType === 'PERCENTAGE') return subtotal * (discountValue / 100);
    return 0;
  },

  getServiceChargeAmount: () => {
    const { getSubtotal, getDiscountAmount, serviceChargeRate } = get();
    const dpp = Math.max(0, getSubtotal() - getDiscountAmount());
    return dpp * (serviceChargeRate / 100);
  },

  getTaxAmount: () => {
    const { getSubtotal, getDiscountAmount, getServiceChargeAmount, taxRate } = get();
    const dpp = Math.max(0, getSubtotal() - getDiscountAmount()) + getServiceChargeAmount();
    return dpp * (taxRate / 100);
  },

  getTotal: () => {
    const { getSubtotal, getDiscountAmount, getServiceChargeAmount, getTaxAmount } = get();
    return Math.max(0, getSubtotal() - getDiscountAmount()) + getServiceChargeAmount() + getTaxAmount();
  }

}));
