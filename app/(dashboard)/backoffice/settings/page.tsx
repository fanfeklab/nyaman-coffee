'use client';

import React from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { inventoryMode, setInventoryMode } = useInventoryStore();

  const handleModeChange = (mode: 'LOOSE' | 'STRICT' | 'OFF') => {
    setInventoryMode(mode);
    toast.success(`Inventory Mode diubah ke ${mode}`);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl flex flex-col gap-8">
       <div>
         <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black mb-2">PENGATURAN</h1>
         <p className="font-inter font-bold text-gray-500">Konfigurasi operasional dan preferensi sistem.</p>
       </div>

       <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
          <h2 className="font-space-grotesk font-black text-2xl uppercase border-b-4 border-black pb-2">Inventory Mode</h2>
          
          <div className="flex flex-col gap-4">
             <div 
               onClick={() => handleModeChange('LOOSE')}
               className={`p-4 border-4 border-black rounded-xl cursor-pointer transition-all ${inventoryMode === 'LOOSE' ? 'bg-[#00E5FF]' : 'hover:bg-gray-50'}`}
             >
                <div className="flex items-center justify-between mb-2">
                   <Label className="font-space-grotesk font-black text-lg uppercase cursor-pointer">LOOSE (Default)</Label>
                   <div className={`w-6 h-6 border-4 border-black rounded-full ${inventoryMode === 'LOOSE' ? 'bg-black' : 'bg-white'}`} />
                </div>
                <p className="font-inter font-bold text-sm text-gray-700">Stok bisa minus. Kasir dapat terus menjual meskipun stok tercatat habis (cocok untuk operasional kafe fleksibel yang stoknya sering selisih).</p>
             </div>

             <div 
               onClick={() => handleModeChange('STRICT')}
               className={`p-4 border-4 border-black rounded-xl cursor-pointer transition-all ${inventoryMode === 'STRICT' ? 'bg-[#FFD100]' : 'hover:bg-gray-50'}`}
             >
                <div className="flex items-center justify-between mb-2">
                   <Label className="font-space-grotesk font-black text-lg uppercase cursor-pointer">STRICT</Label>
                   <div className={`w-6 h-6 border-4 border-black rounded-full ${inventoryMode === 'STRICT' ? 'bg-black' : 'bg-white'}`} />
                </div>
                <p className="font-inter font-bold text-sm text-gray-700">Penjualan dicegah jika stok kurang. Kasir tdak bisa checkout produk yang bahan rinciannya tidak mencukupi.</p>
             </div>

             <div 
               onClick={() => handleModeChange('OFF')}
               className={`p-4 border-4 border-black rounded-xl cursor-pointer transition-all ${inventoryMode === 'OFF' ? 'bg-[#FF90E8]' : 'hover:bg-gray-50'}`}
             >
                <div className="flex items-center justify-between mb-2">
                   <Label className="font-space-grotesk font-black text-lg uppercase cursor-pointer">OFF</Label>
                   <div className={`w-6 h-6 border-4 border-black rounded-full ${inventoryMode === 'OFF' ? 'bg-black' : 'bg-white'}`} />
                </div>
                <p className="font-inter font-bold text-sm text-gray-700">Pemotongan inventori bahan baku dimatikan total. Ini berguna jika hanya butuh perhitungan kasir tanpa pusing mencatat gramasi bahan baku.</p>
             </div>
          </div>
       </div>
    </div>
  );
}
