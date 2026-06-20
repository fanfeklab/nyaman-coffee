'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useTransactionStore, Transaction } from '@/store/useTransactionStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Save, Plus, Trash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const generateId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(7)}`;

export default function ManualSalesPage() {
  const router = useRouter();
  const { user, users } = useAuthStore();
  const { products } = useInventoryStore();
  const { addTransaction } = useTransactionStore();

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'MANAGER') {
       router.replace('/pos');
       toast.error('Akses ditolak: Anda tidak memiliki izin ke halaman ini');
    }
  }, [user, router]);

  const [cashierId, setCashierId] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'TUNAI' | 'QRIS'>('TUNAI');
  
  const [items, setItems] = useState<{ productId: string, qty: number }[]>([]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', qty: 1 }]);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const calculateTotal = () => {
    let total = 0;
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        total += product.basePrice * item.qty;
      }
    });
    return total;
  };

  const currentTotal = calculateTotal();

  const handleSave = () => {
    if (!cashierId) return toast.error('Pilih/isi kasir terlebih dahulu');
    if (!timestamp) return toast.error('Isi waktu transaksi');
    if (items.length === 0) return toast.error('Belum ada item yang ditambahkan');
    if (items.some(i => !i.productId || i.qty <= 0)) return toast.error('Pastikan semua item valid');

    const mappedItems = items.map(i => {
      const product = products.find(p => p.id === i.productId)!;
      return {
        id: generateId('i'),
        product,
        qty: i.qty
      };
    });

    const tx: Transaction = {
      id: generateId('tx_manual'),
      shiftId: generateId('s_manual'), // Since it's manual, generate unique shift or assign generic
      cashierId: cashierId,
      items: mappedItems,
      total: currentTotal,
      paymentMethod: paymentMethod,
      timestamp: new Date(timestamp),
      status: 'COMPLETED'
    };

    addTransaction(tx);
    toast.success('Transaksi masa lalu berhasil diinput!');

    // Reset
    setItems([]);
    setTimestamp('');
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl flex flex-col gap-8 h-full overflow-y-auto hide-scrollbar">
       <div>
         <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black mb-2">INPUT PENJUALAN MANUAL</h1>
         <p className="font-inter font-bold text-gray-500">Fitur khusus Super Admin / SPV untuk memasukkan histori transaksi masa lalu.</p>
       </div>

       <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           <div className="flex flex-col gap-2">
             <Label className="font-bold text-lg">Waktu Transaksi (Perkiraan)</Label>
             <Input 
               type="datetime-local" 
               value={timestamp} 
               onChange={(e) => setTimestamp(e.target.value)} 
               className="h-12 border-2 border-black" 
             />
           </div>

           <div className="flex flex-col gap-2">
             <Label className="font-bold text-lg">Kasir Yang Bertugas</Label>
             <Select 
               value={cashierId} 
               onValueChange={(val) => setCashierId(val || '')}
             >
               <SelectTrigger className="flex h-12 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0">
                 <SelectValue placeholder="-- Pilih Kasir --" />
               </SelectTrigger>
               <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold">
                 {users.map(u => (
                   <SelectItem key={u.id} value={u.username}>{u.fullName} ({u.username})</SelectItem>
                 ))}
                 <SelectItem value="kasir_lainnya">Lainnya...</SelectItem>
               </SelectContent>
             </Select>
           </div>
         </div>

         <div className="flex flex-col gap-2">
             <Label className="font-bold text-lg">Metode Pembayaran</Label>
             <Select 
               value={paymentMethod} 
               onValueChange={(val) => setPaymentMethod((val as 'TUNAI' | 'QRIS') || 'TUNAI')}
             >
               <SelectTrigger className="flex h-12 w-full md:w-1/2 rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0">
                 <SelectValue placeholder="Pilih Metode Pembayaran" />
               </SelectTrigger>
               <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold">
                 <SelectItem value="TUNAI">TUNAI</SelectItem>
                 <SelectItem value="QRIS">QRIS</SelectItem>
               </SelectContent>
             </Select>
         </div>

         <div className="border-t-4 border-black pt-6">
           <div className="flex justify-between items-center mb-4">
             <h2 className="font-space-grotesk font-black text-2xl uppercase">Daftar Item Dibeli</h2>
             <Button onClick={handleAddItem} className="bg-black text-white hover:bg-gray-800 font-space-grotesk font-black uppercase border-2 border-black">
               <Plus className="w-4 h-4 mr-2" />
               Tambah Item
             </Button>
           </div>

           {items.length === 0 ? (
             <div className="p-8 border-4 border-dashed border-gray-300 rounded-xl text-center text-gray-500 font-bold">
               Belum ada item ditambahkan. Klik tombol di atas untuk menambah barang.
             </div>
           ) : (
             <div className="flex flex-col gap-4">
               {items.map((item, idx) => (
                 <div key={idx} className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 border-2 border-black rounded-xl">
                   <div className="flex-1 w-full">
                     <Label className="font-bold mb-1 block">Produk Menu</Label>
                     <Select 
                       value={item.productId} 
                       onValueChange={(val) => handleUpdateItem(idx, 'productId', val || '')}
                     >
                       <SelectTrigger className="flex h-12 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-sm focus:outline-none focus:ring-0">
                         <SelectValue placeholder="-- Pilih Menu --" />
                       </SelectTrigger>
                       <SelectContent className="border-4 border-black rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold">
                         {products.map(p => (
                           <SelectItem key={p.id} value={p.id}>{p.name} - Rp {p.basePrice.toLocaleString()}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   
                   <div className="w-full md:w-32 shrink-0">
                     <Label className="font-bold mb-1 block">Qty</Label>
                     <Input 
                       type="number" 
                       value={item.qty} 
                       min={1}
                       onChange={(e) => handleUpdateItem(idx, 'qty', parseInt(e.target.value) || 1)} 
                       className="h-12 border-2 border-black" 
                     />
                   </div>

                   <div className="w-auto pt-6 flex items-center justify-center">
                     <Button 
                       variant="destructive" 
                       onClick={() => handleRemoveItem(idx)}
                       className="h-12 px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:translate-y-1 hover:shadow-none transition-all"
                     >
                       <Trash className="w-5 h-5 mx-auto" />
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>

         <div className="bg-[#FFD100] border-4 border-black p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-4 gap-4">
           <div className="w-full md:w-auto">
              <span className="font-space-grotesk font-black uppercase text-gray-800 text-sm block">Total Tagihan Transaksi</span>
              <span className="text-3xl font-black text-black">Rp {currentTotal.toLocaleString('id-ID')}</span>
           </div>
           
           <Button onClick={handleSave} className="w-full md:w-auto h-14 text-sm md:text-lg bg-[#00E5FF] text-black hover:bg-cyan-400 font-space-grotesk font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
             <Save className="w-5 h-5 mr-2" />
             Simpan Ke Riwayat
           </Button>
         </div>

       </div>
    </div>
  );
}
