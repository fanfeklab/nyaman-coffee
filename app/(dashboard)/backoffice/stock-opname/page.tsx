'use client';

import React, { useState } from 'react';
import { useInventoryStore, RawMaterial } from '@/store/useInventoryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileDiff } from 'lucide-react';

export default function StockOpnamePage() {
  const { rawMaterials, addStockOpname, stockOpnames } = useInventoryStore();
  const { user } = useAuthStore();
  
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Local state for stock opname form
  const [opnameItems, setOpnameItems] = useState<{ rawMaterialId: string; systemStock: number; actualStock: number; reason: string }[]>([]);

  const handleStartOpname = () => {
    // initialize opname form data with all raw materials
    setOpnameItems(
      rawMaterials.map(rm => ({
        rawMaterialId: rm.id,
        systemStock: rm.currentStock,
        actualStock: rm.currentStock,
        reason: ''
      }))
    );
    setIsOpnameModalOpen(true);
  };

  const handleItemChange = (id: string, actualStock: number, reason: string) => {
    setOpnameItems(prev => prev.map(item => item.rawMaterialId === id ? { ...item, actualStock, reason } : item));
  };

  const handleSubmitOpname = () => {
    // only save items that actually changed
    const changedItems = opnameItems.filter(item => item.systemStock !== item.actualStock);
    if (changedItems.length === 0) {
      toast.info('Tidak ada selisih stok yang dicatat.');
      setIsOpnameModalOpen(false);
      return;
    }

    // require reason for changes
    for (const item of changedItems) {
      if (!item.reason) {
        toast.error('Harap isi alasan untuk stok yang memiliki selisih.');
        return;
      }
    }

    addStockOpname({
      id: 'so_' + Date.now().toString(36),
      date: new Date().toISOString(),
      createdBy: user?.fullName || 'System',
      items: changedItems.map(item => ({
        rawMaterialId: item.rawMaterialId,
        systemStock: item.systemStock,
        actualStock: item.actualStock,
        difference: item.actualStock - item.systemStock,
        reason: item.reason
      }))
    });

    toast.success('Stock Opname berhasil disimpan.');
    setIsOpnameModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-6 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl">
        <div>
          <h1 className="text-3xl font-space-grotesk font-black uppercase text-black">Stock Opname</h1>
          <p className="text-gray-600 font-inter font-bold mt-1">Penyesuaian stok bahan baku</p>
        </div>
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') && (
          <Button onClick={handleStartOpname} size="lg" className="border-2 border-black">
            MULAI OPNAME
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl overflow-x-auto">
          <h2 className="text-xl font-space-grotesk font-black uppercase text-black mb-4">Riwayat Opname</h2>
          {stockOpnames.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
              <FileDiff className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="font-inter font-bold text-gray-500">Belum ada riwayat stock opname.</p>
            </div>
          ) : (
             <div className="space-y-4">
               {stockOpnames.map(so => (
                 <div key={so.id} className="p-4 border-2 border-black rounded-xl">
                   <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-gray-200 pb-2">
                     <div>
                       <p className="font-space-grotesk font-black text-lg">Tanggal: {new Date(so.date).toLocaleString('id-ID')}</p>
                       <p className="font-inter font-bold text-gray-500 text-sm">Oleh: {so.createdBy}</p>
                     </div>
                   </div>
                   <table className="w-full text-left font-inter">
                     <thead>
                       <tr className="border-b-2 border-black">
                         <th className="py-2.5 font-black uppercase">Bahan Baku</th>
                         <th className="py-2.5 font-black uppercase text-center">Stok Sistem</th>
                         <th className="py-2.5 font-black uppercase text-center">Stok Aktual</th>
                         <th className="py-2.5 font-black uppercase text-center">Selisih</th>
                         <th className="py-2.5 font-black uppercase">Alasan</th>
                       </tr>
                     </thead>
                     <tbody>
                       {so.items.map(item => {
                         const rm = rawMaterials.find(r => r.id === item.rawMaterialId);
                         return (
                           <tr key={item.rawMaterialId} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                             <td className="py-2.5 font-bold">{rm?.name || 'Unknown'}</td>
                             <td className="py-2.5 text-center">{item.systemStock}</td>
                             <td className="py-2.5 text-center">{item.actualStock}</td>
                             <td className={`py-2.5 text-center font-black ${item.difference < 0 ? 'text-red-500' : 'text-green-500'}`}>
                               {item.difference > 0 ? '+' : ''}{item.difference}
                             </td>
                             <td className="py-2.5 text-sm">{item.reason}</td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>

      <Dialog open={isOpnameModalOpen} onOpenChange={setIsOpnameModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Mulai Stock Opname</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-muted/50 border-2 border-black rounded-xl mb-4">
            <Input 
              placeholder="Cari bahan baku..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="overflow-y-auto flex-grow px-1">
            <table className="w-full text-left font-inter">
                <thead>
                  <tr className="border-b-2 border-black sticky top-0 bg-white z-10">
                    <th className="py-2.5 font-black uppercase">Bahan Baku</th>
                    <th className="py-2.5 font-black uppercase text-center">Sistem</th>
                    <th className="py-2.5 font-black uppercase w-32">Aktual</th>
                    <th className="py-2.5 font-black uppercase">Alasan Selisih</th>
                  </tr>
                </thead>
                <tbody>
                  {opnameItems.filter(item => {
                    const rm = rawMaterials.find(r => r.id === item.rawMaterialId);
                    return rm?.name.toLowerCase().includes(searchTerm.toLowerCase());
                  }).map(item => {
                    const rm = rawMaterials.find(r => r.id === item.rawMaterialId);
                    const diff = item.actualStock - item.systemStock;
                    return (
                      <tr key={item.rawMaterialId} className="border-b border-gray-200">
                        <td className="py-2.5 font-bold">
                          {rm?.name} <span className="text-gray-400 text-xs text-normal block">{rm?.unit}</span>
                        </td>
                        <td className="py-2.5 text-center">{item.systemStock}</td>
                        <td className="py-2.5">
                          <Input 
                            type="number" 
                            min="0"
                            value={item.actualStock === 0 ? '' : item.actualStock}
                            onChange={(e) => handleItemChange(item.rawMaterialId, Number(e.target.value), item.reason)}
                            className="bg-white border-2 border-black font-mono h-9"
                          />
                        </td>
                        <td className="py-2.5">
                          <Input 
                            placeholder={diff !== 0 ? "Wajib diisi..." : "-"}
                            value={item.reason}
                            onChange={(e) => handleItemChange(item.rawMaterialId, item.actualStock, e.target.value)}
                            disabled={diff === 0}
                            className={`bg-white h-9 ${diff !== 0 && !item.reason ? 'border-red-500 border-2' : ''}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </div>
          <DialogFooter className="mt-4 pt-4 border-t-4 border-dashed border-gray-200">
            <Button variant="outline" onClick={() => setIsOpnameModalOpen(false)}>BATAL</Button>
            <Button onClick={handleSubmitOpname} className="bg-black text-white px-8">SIMPAN OPNAME</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
