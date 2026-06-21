import { idbStorage } from '@/lib/idbStorage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  taxRate: number;
  enableTax: boolean;
  serviceChargeRate: number;
  enableServiceCharge: boolean;
  receiptFooter: string;
  printerAddress: string;

  setStoreName: (name: string) => void;
  setStoreAddress: (address: string) => void;
  setStorePhone: (phone: string) => void;
  setTaxRate: (rate: number) => void;
  setEnableTax: (enable: boolean) => void;
  setServiceChargeRate: (rate: number) => void;
  setEnableServiceCharge: (enable: boolean) => void;
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
      enableTax: true,
      serviceChargeRate: 5,
      enableServiceCharge: true,
      receiptFooter: 'Terima kasih atas kunjungan Anda!',
      printerAddress: '192.168.1.100', // Mock thermal printer address

      setStoreName: (name) => set({ storeName: name }),
      setStoreAddress: (address) => set({ storeAddress: address }),
      setStorePhone: (phone) => set({ storePhone: phone }),
      setTaxRate: (rate) => set({ taxRate: rate }),
      setEnableTax: (enable) => set({ enableTax: enable }),
      setServiceChargeRate: (rate) => set({ serviceChargeRate: rate }),
      setEnableServiceCharge: (enable) => set({ enableServiceCharge: enable }),
      setReceiptFooter: (footer) => set({ receiptFooter: footer }),
      setPrinterAddress: (address) => set({ printerAddress: address }),
    }),
    {
      name: 'pos-settings-storage',
  storage: createJSONStorage(() => idbStorage),
    }
  )
);
