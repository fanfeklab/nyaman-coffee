'use client';

import React, { useEffect, useState } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useShiftStore } from '@/store/useShiftStore';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Store, Receipt, Printer, PackageSearch, Save, Database } from 'lucide-react';
import { seedMockDataToFirebase } from '@/lib/firebase/services';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { inventoryMode, setInventoryMode, clearInventory } = useInventoryStore();
  const settings = useSettingsStore();
  const { clearTransactions } = useTransactionStore();
  const { clearShiftHistory } = useShiftStore();

  const [activeTab, setActiveTab] = useState<'GENERAL' | 'POS' | 'HARDWARE' | 'INVENTORY' | 'FIREBASE' | 'DANGER'>('GENERAL');
  const [isSeeding, setIsSeeding] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [taxRate, setTaxRate] = useState(settings.taxRate.toString());
  const [enableTax, setEnableTax] = useState(settings.enableTax);
  const [serviceChargeRate, setServiceChargeRate] = useState(settings.serviceChargeRate.toString());
  const [enableServiceCharge, setEnableServiceCharge] = useState(settings.enableServiceCharge);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [printerAddress, setPrinterAddress] = useState(settings.printerAddress);

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'MANAGER') {
       router.replace('/pos');
       toast.error('Akses ditolak: Anda tidak memiliki izin ke halaman ini');
    }
  }, [user, router]);

  const handleModeChange = (mode: 'LOOSE' | 'STRICT' | 'OFF') => {
    setInventoryMode(mode);
    toast.success(`Inventory Mode diubah ke ${mode}`);
  };

  const handleSaveGeneral = () => {
    settings.setStoreName(storeName);
    settings.setStoreAddress(storeAddress);
    settings.setStorePhone(storePhone);
    toast.success('Pengaturan Toko disimpan');
  };

  const handleSavePOS = () => {
    settings.setTaxRate(parseFloat(taxRate) || 0);
    settings.setEnableTax(enableTax);
    settings.setServiceChargeRate(parseFloat(serviceChargeRate) || 0);
    settings.setEnableServiceCharge(enableServiceCharge);
    settings.setReceiptFooter(receiptFooter);
    toast.success('Konfigurasi POS disimpan');
  };

  const handleSaveHardware = () => {
    settings.setPrinterAddress(printerAddress);
    toast.success('Pengaturan Printer disimpan');
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl flex flex-col gap-8 h-full overflow-y-auto hide-scrollbar">
       <div>
         <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black mb-2">PENGATURAN</h1>
         <p className="font-inter font-bold text-gray-500">Konfigurasi operasional dan preferensi sistem.</p>
       </div>

       <div className="flex flex-col md:flex-row gap-8">
         {/* Tabs Navigation */}
         <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
           <button 
             onClick={() => setActiveTab('GENERAL')}
             className={cn("p-4 border-4 border-black rounded-xl flex items-center gap-3 font-space-grotesk font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none", activeTab === 'GENERAL' ? "bg-black text-white" : "bg-white text-black")}
           >
             <Store className="w-5 h-5" /> Toko
           </button>
           <button 
             onClick={() => setActiveTab('POS')}
             className={cn("p-4 border-4 border-black rounded-xl flex items-center gap-3 font-space-grotesk font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none", activeTab === 'POS' ? "bg-black text-white" : "bg-white text-black")}
           >
             <Receipt className="w-5 h-5" /> Kasir & Struk
           </button>
           <button 
             onClick={() => setActiveTab('INVENTORY')}
             className={cn("p-4 border-4 border-black rounded-xl flex items-center gap-3 font-space-grotesk font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none", activeTab === 'INVENTORY' ? "bg-black text-white" : "bg-white text-black")}
           >
             <PackageSearch className="w-5 h-5" /> Inventory Mode
           </button>
           <button 
             onClick={() => setActiveTab('HARDWARE')}
             className={cn("p-4 border-4 border-black rounded-xl flex items-center gap-3 font-space-grotesk font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none", activeTab === 'HARDWARE' ? "bg-black text-white" : "bg-white text-black")}
           >
             <Printer className="w-5 h-5" /> Hardware
           </button>
           {user?.role === 'SUPER_ADMIN' && (
             <button 
               onClick={() => setActiveTab('FIREBASE')}
               className={cn("p-4 border-4 border-black rounded-xl flex items-center gap-3 font-space-grotesk font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none", activeTab === 'FIREBASE' ? "bg-black text-white" : "bg-white text-black")}
             >
               <Database className="w-5 h-5" /> Integrasi Cloud
             </button>
           )}
           {user?.role === 'SUPER_ADMIN' && (
             <button 
               onClick={() => setActiveTab('DANGER')}
               className={cn("p-4 border-4 border-black rounded-xl flex items-center gap-3 font-space-grotesk font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none", activeTab === 'DANGER' ? "bg-red-600 text-white" : "bg-white text-red-600")}
             >
               <Printer className="w-5 h-5 hidden" /> Danger Zone
             </button>
           )}
         </div>

         {/* Tab Content */}
         <div className="flex-1">
           
           {activeTab === 'GENERAL' && (
             <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
               <h2 className="font-space-grotesk font-black text-2xl uppercase border-b-4 border-black pb-2">Identitas Toko</h2>
               
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-2">
                   <Label className="font-bold text-lg">Nama Usaha / Toko</Label>
                   <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="h-12 border-2 border-black" />
                 </div>
                 <div className="flex flex-col gap-2">
                   <Label className="font-bold text-lg">Alamat Lengkap</Label>
                   <Input value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} className="h-12 border-2 border-black" />
                 </div>
                 <div className="flex flex-col gap-2">
                   <Label className="font-bold text-lg">Nomor Telepon / WhatsApp</Label>
                   <Input value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className="h-12 border-2 border-black" />
                 </div>
                 
                 <Button onClick={handleSaveGeneral} className="mt-4 h-14 text-lg bg-[#00E5FF] text-black hover:bg-cyan-400 font-space-grotesk font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                   <Save className="w-5 h-5 mr-2" />
                   Simpan Pengaturan
                 </Button>
               </div>
             </div>
           )}

           {activeTab === 'POS' && (
             <div className="bg-[#FF90E8] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
               <h2 className="font-space-grotesk font-black text-2xl uppercase border-b-4 border-black pb-2">Konfigurasi Kasir (Default)</h2>
               
               <div className="flex flex-col gap-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center justify-between"><Label className="font-bold text-lg">Default Pajak (PPN) %</Label><button onClick={() => setEnableTax(!enableTax)} type="button" className={cn("px-3 py-1 font-space-grotesk font-black border-2 border-black rounded-lg text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all uppercase", enableTax ? "bg-[#00E5FF] text-black" : "bg-gray-300 text-gray-700")}>{enableTax ? 'Aktif' : 'Non-Aktif'}</button></div>
                     <Input value={taxRate} onChange={(e) => setTaxRate(e.target.value)} type="number" step="0.1" className="h-12 border-2 border-black" />
                     <small className="text-black/70 font-bold">Pajak akan otomatis dimasukkan pada setiap bil baru.</small>
                   </div>
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center justify-between"><Label className="font-bold text-lg">Default Service Charge %</Label><button onClick={() => setEnableServiceCharge(!enableServiceCharge)} type="button" className={cn("px-3 py-1 font-space-grotesk font-black border-2 border-black rounded-lg text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all uppercase", enableServiceCharge ? "bg-[#00E5FF] text-black" : "bg-gray-300 text-gray-700")}>{enableServiceCharge ? 'Aktif' : 'Non-Aktif'}</button></div>
                     <Input value={serviceChargeRate} onChange={(e) => setServiceChargeRate(e.target.value)} type="number" step="0.1" className="h-12 border-2 border-black" />
                     <small className="text-black/70 font-bold">Biaya pelayanan restoran/kafe.</small>
                   </div>
                 </div>
                 <div className="flex flex-col gap-2 mt-2">
                   <Label className="font-bold text-lg">Pesan Footer Struk (Nota)</Label>
                   <Input value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)} className="h-12 border-2 border-black" />
                 </div>
                 
                 <Button onClick={handleSavePOS} className="mt-4 h-14 text-lg bg-black text-white hover:bg-gray-800 font-space-grotesk font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all">
                   <Save className="w-5 h-5 mr-2" />
                   Simpan Konfigurasi
                 </Button>
               </div>
             </div>
           )}

           {activeTab === 'INVENTORY' && (
             <div className="bg-[#FFD100] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
               <h2 className="font-space-grotesk font-black text-2xl uppercase border-b-4 border-black pb-2">Inventory Mode</h2>
               
               <div className="flex flex-col gap-4">
                  <div 
                    onClick={() => handleModeChange('LOOSE')}
                    className={`p-4 border-4 border-black rounded-xl cursor-pointer transition-all bg-white hover:bg-gray-50`}
                  >
                     <div className="flex items-center justify-between mb-2">
                        <Label className="font-space-grotesk font-black text-lg uppercase cursor-pointer">LOOSE (Default)</Label>
                        <div className={`w-6 h-6 border-4 border-black rounded-full ${inventoryMode === 'LOOSE' ? 'bg-[#00E5FF]' : 'bg-white'}`} />
                     </div>
                     <p className="font-inter font-bold text-sm text-gray-700">Stok bisa minus. Kasir dapat terus menjual meskipun stok tercatat habis (cocok untuk operasional kafe fleksibel yang stoknya sering selisih).</p>
                  </div>

                  <div 
                    onClick={() => handleModeChange('STRICT')}
                    className={`p-4 border-4 border-black rounded-xl cursor-pointer transition-all bg-white hover:bg-gray-50`}
                  >
                     <div className="flex items-center justify-between mb-2">
                        <Label className="font-space-grotesk font-black text-lg uppercase cursor-pointer">STRICT</Label>
                        <div className={`w-6 h-6 border-4 border-black rounded-full ${inventoryMode === 'STRICT' ? 'bg-[#00E5FF]' : 'bg-white'}`} />
                     </div>
                     <p className="font-inter font-bold text-sm text-gray-700">Penjualan dicegah jika stok kurang. Kasir tdak bisa checkout produk yang bahan rinciannya tidak mencukupi.</p>
                  </div>

                  <div 
                    onClick={() => handleModeChange('OFF')}
                    className={`p-4 border-4 border-black rounded-xl cursor-pointer transition-all bg-white hover:bg-gray-50`}
                  >
                     <div className="flex items-center justify-between mb-2">
                        <Label className="font-space-grotesk font-black text-lg uppercase cursor-pointer">OFF</Label>
                        <div className={`w-6 h-6 border-4 border-black rounded-full ${inventoryMode === 'OFF' ? 'bg-[#00E5FF]' : 'bg-white'}`} />
                     </div>
                     <p className="font-inter font-bold text-sm text-gray-700">Pemotongan inventori bahan baku dimatikan total. Ini berguna jika hanya butuh perhitungan kasir tanpa pusing mencatat gramasi bahan baku.</p>
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'HARDWARE' && (
             <div className="bg-[#FF6321] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
               <h2 className="font-space-grotesk font-black text-2xl uppercase border-b-4 border-black text-white pb-2">Hardware & Printer</h2>
               
               <div className="flex flex-col gap-4 text-white">
                 <div className="flex flex-col gap-2">
                   <Label className="font-bold text-lg text-white">IP Server Thermal Printer (LAN/WiFi)</Label>
                   <Input value={printerAddress} onChange={(e) => setPrinterAddress(e.target.value)} className="h-12 border-2 border-black bg-white text-black" placeholder="Contoh: 192.168.1.100" />
                   <small className="font-bold">Alamat IP perangkat printer dapur atau kasir.</small>
                 </div>
                 
                 <Button onClick={handleSaveHardware} className="mt-4 h-14 text-lg bg-black text-white hover:bg-gray-800 font-space-grotesk font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all">
                   <Save className="w-5 h-5 mr-2" />
                   Simpan Hardware
                 </Button>
               </div>
             </div>
           )}

           {activeTab === 'FIREBASE' && user?.role === 'SUPER_ADMIN' && (
             <div className="bg-[#E6F4F1] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
               <h2 className="font-space-grotesk font-black text-2xl uppercase border-b-4 border-black pb-2 text-black">Integrasi Firebase (Cloud Database)</h2>
               
               <div className="flex flex-col gap-4">
                 <p className="font-inter font-bold text-gray-700">Gunakan fitur ini untuk mensinkronisasi data POS lokal yang sedang Anda kerjakan ke Cloud Firestore secara live mengikuti setup environment yang telah ditentukan.</p>
                 
                 <div className="flex flex-col md:flex-row gap-4 mt-4">
                   <Button 
                     disabled={isSeeding}
                     onClick={async () => {
                       setIsSeeding(true);
                       toast.loading('Sedang mengunggah data ke Firestore...', { id: 'seed' });
                       const success = await seedMockDataToFirebase();
                       if (success) {
                         toast.success('Berhasil seed data ke Firebase', { id: 'seed' });
                       } else {
                         toast.error('Gagal seed data. Pastikan konfigurasi Firebase valid.', { id: 'seed' });
                       }
                       setIsSeeding(false);
                     }} 
                     className="flex-1 h-14 text-sm bg-black text-[#00E5FF] hover:bg-gray-800 font-space-grotesk font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,229,255,1)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                   >
                     {isSeeding ? 'Proses...' : 'Seed Data Master ke Firebase'}
                   </Button>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'DANGER' && user?.role === 'SUPER_ADMIN' && (
             <div className="bg-red-500 border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
               <h2 className="font-space-grotesk font-black text-2xl uppercase border-b-4 border-black text-white pb-2">DANGER ZONE</h2>
               
               <div className="flex flex-col gap-4 text-white">
                 <p className="font-bold">Hati-hati! Tindakan di bawah ini tidak dapat dibatalkan dan akan menghapus seluruh data yang terkait dari sistem. Tindakan ini tidak akan tercatat dalam audit trail.</p>
                 
                 <div className="flex flex-col md:flex-row gap-4 mt-4">
                   <Button onClick={() => {
                     const username = window.prompt('Masukkan Username SUPER ADMIN untuk konfirmasi:');
                     if (username !== user.username) return toast.error('Username salah');
                     const pin = window.prompt('Masukkan PIN Anda:');
                     if (pin !== user.pin) return toast.error('PIN salah');
                     
                     clearTransactions();
                     toast.success('Semua transaksi berhasil dihapus');
                   }} className="flex-1 h-14 text-sm bg-black text-white hover:bg-gray-800 font-space-grotesk font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all">
                     Hapus Semua Transaksi
                   </Button>

                   <Button onClick={() => {
                     const username = window.prompt('Masukkan Username SUPER ADMIN untuk konfirmasi:');
                     if (username !== user.username) return toast.error('Username salah');
                     const pin = window.prompt('Masukkan PIN Anda:');
                     if (pin !== user.pin) return toast.error('PIN salah');
                     
                     clearShiftHistory();
                     toast.success('Semua Riwayat Shift berhasil dihapus');
                   }} className="flex-1 h-14 text-sm bg-black text-white hover:bg-gray-800 font-space-grotesk font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all">
                     Hapus Semua Riwayat Shift
                   </Button>

                   <Button onClick={() => {
                     const username = window.prompt('Masukkan Username SUPER ADMIN untuk konfirmasi:');
                     if (username !== user.username) return toast.error('Username salah');
                     const pin = window.prompt('Masukkan PIN Anda:');
                     if (pin !== user.pin) return toast.error('PIN salah');
                     
                     clearInventory();
                     toast.success('Semua Menu dan Bahan Baku berhasil dihapus');
                   }} className="flex-1 h-14 text-sm bg-black text-white hover:bg-gray-800 font-space-grotesk font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-1 hover:shadow-none transition-all">
                     Hapus Seluruh Menu/Item
                   </Button>
                 </div>
               </div>
             </div>
           )}

         </div>
       </div>
    </div>
  );
}

