import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxRate: number;
  serviceChargeRate: number;
  receiptFooter: string;
  printerAddress: string;

  setStoreName: (name: string) => void;
  setStoreAddress: (address: string) => void;
  setStorePhone: (phone: string) => void;
  setTaxRate: (rate: number) => void;
  setServiceChargeRate: (rate: number) => void;
  setReceiptFooter: (footer: string) => void;
  setPrinterAddress: (address: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      storeName: 'Nyaman Coffee',
      storeAddress: 'Jl. Jend. Sudirman No. 1, Jakarta Pusat',
      storePhone: '0812-3456-7890',
      taxRate: 11,
      serviceChargeRate: 5,
      receiptFooter: 'Terima kasih atas kunjungan Anda!',
      printerAddress: '192.168.1.100', // Mock thermal printer address

      setStoreName: (name) => set({ storeName: name }),
      setStoreAddress: (address) => set({ storeAddress: address }),
      setStorePhone: (phone) => set({ storePhone: phone }),
      setTaxRate: (rate) => set({ taxRate: rate }),
      setServiceChargeRate: (rate) => set({ serviceChargeRate: rate }),
      setReceiptFooter: (footer) => set({ receiptFooter: footer }),
      setPrinterAddress: (address) => set({ printerAddress: address }),
    }),
    {
      name: 'pos-settings-storage',
    }
  )
);
