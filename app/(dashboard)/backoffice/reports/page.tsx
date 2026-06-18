'use client';

import React, { useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useInventoryStore } from '@/store/useInventoryStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ban, Search, FileText } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

export default function ReportsPage() {
  const { transactions, voidTransaction } = useTransactionStore();
  const { revertCheckoutInventory } = useInventoryStore();
  const { user } = useAuthStore();
  
  const [search, setSearch] = useState('');
  const [voidConfirmId, setVoidConfirmId] = useState<string | null>(null);

  const filteredData = transactions.filter(tx => 
    tx.id.toLowerCase().includes(search.toLowerCase()) || 
    tx.cashierId.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = transactions.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.total, 0);

  const handleVoid = () => {
    if (!voidConfirmId) return;
    const tx = transactions.find(t => t.id === voidConfirmId);
    if (!tx) return;
    
    // revert inventory
    revertCheckoutInventory(tx.items.map(i => ({ productId: i.product.id, qty: i.qty })));
    
    // void
    voidTransaction(voidConfirmId);
    toast.success('Transaksi berhasil di-void (dibatalkan). Stok dikembalikan.');
    setVoidConfirmId(null);
  };

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6">
      <div>
         <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black">Laporan Penjualan</h1>
         <p className="font-inter font-bold text-gray-500">Lihat histori transaksi dan gross revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-space-grotesk font-black uppercase text-gray-500 text-sm">Total Gross Revenue</span>
            <div className="text-3xl font-black text-black">{formatRupiah(totalRevenue)}</div>
         </div>
         <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-space-grotesk font-black uppercase text-gray-500 text-sm">Total Transaksi</span>
            <div className="text-3xl font-black text-black">{transactions.filter(t => t.status === 'COMPLETED').length} <span className="text-sm">sukses</span></div>
         </div>
         <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-space-grotesk font-black uppercase text-gray-500 text-sm">Void / Batal</span>
            <div className="text-3xl font-black text-red-500">{transactions.filter(t => t.status === 'VOID').length} <span className="text-sm">dibatalkan</span></div>
         </div>
      </div>

      <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden">
         <div className="flex justify-between items-center mb-4">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                placeholder="Cari ID transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
           </div>
         </div>

         <div className="overflow-x-auto border-4 border-black rounded-xl">
            <Table>
               <TableHeader className="bg-gray-100 border-b-4 border-black font-space-grotesk font-black uppercase">
                 <TableRow>
                   <TableHead className="text-black border-r-2 border-black w-[150px]">Waktu</TableHead>
                   <TableHead className="text-black border-r-2 border-black w-[150px]">ID Transaksi</TableHead>
                   <TableHead className="text-black border-r-2 border-black">Kasir</TableHead>
                   <TableHead className="text-black border-r-2 border-black">Metode</TableHead>
                   <TableHead className="text-black border-r-2 border-black text-right">Total</TableHead>
                   <TableHead className="text-black border-r-2 border-black text-center">Status</TableHead>
                   <TableHead className="text-right text-black w-[100px]">Aksi</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody className="font-inter font-bold">
                 {filteredData.map(tx => (
                    <TableRow key={tx.id} className={`border-b-2 border-gray-200 hover:bg-gray-50 ${tx.status === 'VOID' ? 'opacity-50' : ''}`}>
                      <TableCell className="border-r-2 border-gray-200">
                         {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(tx.timestamp))}
                      </TableCell>
                      <TableCell className="border-r-2 border-gray-200">
                         <div className="flex items-center gap-2">
                           <FileText className="w-4 h-4 text-gray-500" />
                           {tx.id}
                         </div>
                      </TableCell>
                      <TableCell className="border-r-2 border-gray-200 uppercase text-xs">{tx.cashierId}</TableCell>
                      <TableCell className="border-r-2 border-gray-200 uppercase">{tx.paymentMethod}</TableCell>
                      <TableCell className="text-right border-r-2 border-gray-200 text-[#FF6321]">{formatRupiah(tx.total)}</TableCell>
                      <TableCell className="text-center border-r-2 border-gray-200">
                        <span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${tx.status === 'COMPLETED' ? 'bg-green-200' : 'bg-red-200'}`}>
                          {tx.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') && tx.status === 'COMPLETED' && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setVoidConfirmId(tx.id)} className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors" title="Void Transaksi">
                              <Ban className="w-4 h-4"/>
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                 ))}
                 
                 {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-gray-500 font-space-grotesk tracking-widest uppercase">
                        Tidak ada transaksi.
                      </TableCell>
                    </TableRow>
                 )}
               </TableBody>
            </Table>
         </div>
      </div>
      
      <ConfirmDialog 
        open={!!voidConfirmId}
        onOpenChange={(open) => !open && setVoidConfirmId(null)}
        title="Void Transaksi?"
        description="Transaksi akan dibatalkan, nominal dikurangi dari total, dan stok bahan baku akan dikembalikan."
        onConfirm={handleVoid}
      />
    </div>
  );
}
