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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 md:p-6 border-4 border-black shadow-[4px_4px_0_0_#000] rounded-xl gap-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-black uppercase text-black">Stock Opname</h1>
          <p className="text-gray-600 font-inter font-bold mt-1">Penyesuaian stok bahan baku</p>
        </div>
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') && (
          <Button onClick={handleStartOpname} size="lg" className="border-2 border-black bg-[#FFD100] text-black hover:bg-[#FFD100]/80 w-full md:w-auto mt-4 md:mt-0">
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
                   <Table className="w-full text-left font-inter">
                     <TableHeader>
                       <TableRow className="border-b-2 border-black">
                         <TableHead className="py-2.5 font-black uppercase text-black">Bahan Baku</TableHead>
                         <TableHead className="py-2.5 font-black uppercase text-center text-black">Stok Sistem</TableHead>
                         <TableHead className="py-2.5 font-black uppercase text-center text-black">Stok Aktual</TableHead>
                         <TableHead className="py-2.5 font-black uppercase text-center text-black">Selisih</TableHead>
                         <TableHead className="py-2.5 font-black uppercase text-black">Alasan</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {so.items.map(item => {
                         const rm = rawMaterials.find(r => r.id === item.rawMaterialId);
                         return (
                           <TableRow key={item.rawMaterialId} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                             <TableCell className="py-2.5 font-bold">{rm?.name || 'Unknown'}</TableCell>
                             <TableCell className="py-2.5 text-center">{item.systemStock}</TableCell>
                             <TableCell className="py-2.5 text-center">{item.actualStock}</TableCell>
                             <TableCell className={`py-2.5 text-center font-black ${item.difference < 0 ? 'text-red-500' : 'text-green-500'}`}>
                               {item.difference > 0 ? '+' : ''}{item.difference}
                             </TableCell>
                             <TableCell className="py-2.5 text-sm">{item.reason}</TableCell>
                           </TableRow>
                         );
                       })}
                     </TableBody>
                   </Table>
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
            <Table className="w-full text-left font-inter">
                <TableHeader>
                  <TableRow className="border-b-2 border-black sticky top-0 bg-white z-10">
                    <TableHead className="py-2.5 font-black uppercase text-black">Bahan Baku</TableHead>
                    <TableHead className="py-2.5 font-black uppercase text-center text-black">Sistem</TableHead>
                    <TableHead className="py-2.5 font-black uppercase w-32 text-black">Aktual</TableHead>
                    <TableHead className="py-2.5 font-black uppercase text-black">Alasan Selisih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opnameItems.filter(item => {
                    const rm = rawMaterials.find(r => r.id === item.rawMaterialId);
                    return rm?.name.toLowerCase().includes(searchTerm.toLowerCase());
                  }).map(item => {
                    const rm = rawMaterials.find(r => r.id === item.rawMaterialId);
                    const diff = item.actualStock - item.systemStock;
                    return (
                      <TableRow key={item.rawMaterialId} className="border-b border-gray-200 hover:bg-transparent">
                        <TableCell className="py-2.5 font-bold">
                          {rm?.name} <span className="text-gray-400 text-xs text-normal block">{rm?.unit}</span>
                        </TableCell>
                        <TableCell className="py-2.5 text-center">{item.systemStock}</TableCell>
                        <TableCell className="py-2.5 p-1 align-top">
                          <Input 
                            type="number" 
                            min="0"
                            value={item.actualStock === 0 ? '' : item.actualStock}
                            onChange={(e) => handleItemChange(item.rawMaterialId, Number(e.target.value), item.reason)}
                            className="bg-white border-2 border-black font-mono h-9"
                          />
                        </TableCell>
                        <TableCell className="py-2.5 p-1 align-top">
                          <Input 
                            placeholder={diff !== 0 ? "Wajib diisi..." : "-"}
                            value={item.reason}
                            onChange={(e) => handleItemChange(item.rawMaterialId, item.actualStock, e.target.value)}
                            disabled={diff === 0}
                            className={`bg-white h-9 ${diff !== 0 && !item.reason ? 'border-red-500 border-2' : ''}`}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
