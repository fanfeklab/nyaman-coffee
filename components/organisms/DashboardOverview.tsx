import React, { useMemo, useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/card';
import { LayoutGrid, TrendingUp, Users, Calendar, ArrowRight, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export function DashboardOverview() {
  const { user } = useAuthStore();
  const { transactions } = useTransactionStore();
  const { rawMaterials, inventoryMode } = useInventoryStore();
  
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days'>('today');

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';

  // Find low stock items
  const lowStockThreshold = 100; // Customizable threshold
  const lowStockItems = useMemo(() => {
    return rawMaterials.filter(rm => {
      // Different threshold based on unit can be implemented here
      let threshold = lowStockThreshold;
      if (rm.unit === 'pcs') threshold = 10;
      if (rm.unit === 'ml' || rm.unit === 'gram') threshold = 500;
      return rm.currentStock <= threshold;
    });
  }, [rawMaterials]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOf7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    return transactions.filter(t => {
       // Filtering by user if not admin
       if (!isAdmin && t.cashierId !== user?.id) {
         return false; 
       }
       if (t.status !== 'COMPLETED') return false;

       const tDate = new Date(t.timestamp);
       if (dateFilter === 'today') return tDate >= startOfToday;
       if (dateFilter === 'yesterday') return tDate >= startOfYesterday && tDate < startOfToday;
       if (dateFilter === '7days') return tDate >= startOf7Days;
       return true;
    }).filter(t => {
       if (!isAdmin) return t.cashierId === user?.id || t.cashierId === user?.username;
       return true;
    });
  }, [transactions, dateFilter, isAdmin, user]);

  const totalRevenue = filteredTransactions.reduce((acc, curr) => acc + curr.total, 0);
  const totalItems = filteredTransactions.reduce((acc, curr) => acc + curr.items.reduce((s, i) => s + i.qty, 0), 0);
  const totalTx = filteredTransactions.length;
  const cashRevenue = filteredTransactions.filter(t => t.paymentMethod === 'TUNAI').reduce((acc, curr) => acc + curr.total, 0);
  const qrisRevenue = filteredTransactions.filter(t => t.paymentMethod === 'QRIS').reduce((acc, curr) => acc + curr.total, 0);

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  return (
    <div className="flex flex-col gap-6 mt-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-black pb-4">
         <h2 className="font-space-grotesk font-black uppercase text-xl tracking-widest text-black">
           Overview Penjualan
         </h2>
         <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="h-10 md:h-12 border-4 border-black rounded-xl font-space-grotesk font-black uppercase px-4 bg-white shadow-[4px_4px_0_0_#000] focus:shadow-none focus:translate-y-1 transition-all outline-none text-sm md:text-base"
         >
            <option value="today">Hari Ini</option>
            <option value="yesterday">Kemarin</option>
            <option value="7days">7 Hari Terakhir</option>
         </select>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="md:col-span-2 bg-[#FF90E8] border-4 border-black p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
             <div className="flex justify-between items-center">
                <div className="bg-white border-4 border-black p-2 rounded-xl w-max">
                   <TrendingUp className="w-5 h-5 text-black" strokeWidth={2.5} />
                </div>
                <span className="font-space-grotesk font-black text-white bg-black px-3 py-1 rounded-full text-xs uppercase tracking-widest">Gross</span>
             </div>
             <div className="mt-2 min-w-0">
                <p className="font-space-grotesk font-black text-gray-800 uppercase tracking-widest text-xs mb-1">Total Pendapatan</p>
                <h3 className="font-inter font-black text-2xl md:text-3xl lg:text-4xl leading-none truncate">{formatRupiah(totalRevenue)}</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t-4 border-black border-dashed">
                <div className="min-w-0">
                   <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest truncate">Tunai</p>
                   <p className="font-inter font-bold text-sm truncate">{formatRupiah(cashRevenue)}</p>
                </div>
                <div className="min-w-0">
                   <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest truncate">QRIS/Non-Tunai</p>
                   <p className="font-inter font-bold text-sm truncate">{formatRupiah(qrisRevenue)}</p>
                </div>
             </div>
          </div>
          
          <div className="bg-[#00E5FF] border-4 border-black p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
             <div className="bg-white border-4 border-black p-2 rounded-xl w-max">
                <FileText className="w-5 h-5 text-black" strokeWidth={2.5} />
             </div>
             <div className="mt-auto">
                <p className="font-space-grotesk font-black text-gray-800 uppercase tracking-widest text-xs mb-1">Total Transaksi</p>
                <h3 className="font-inter font-black text-2xl md:text-3xl lg:text-4xl leading-none">{totalTx} <span className="text-sm font-bold uppercase">Nota</span></h3>
             </div>
          </div>
          
          <div className="bg-[#FFD100] border-4 border-black p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
             <div className="bg-white border-4 border-black p-2 rounded-xl w-max">
                <LayoutGrid className="w-5 h-5 text-black" strokeWidth={2.5} />
             </div>
             <div className="mt-auto">
                <p className="font-space-grotesk font-black text-gray-800 uppercase tracking-widest text-xs mb-1">Item Terjual</p>
                <h3 className="font-inter font-black text-2xl md:text-3xl lg:text-4xl leading-none">{totalItems} <span className="text-sm font-bold uppercase">Pcs</span></h3>
             </div>
          </div>
       </div>

       <Link href="/backoffice/reports" className="bg-black text-white border-4 border-black p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-[4px_4px_0px_0px_#FFD100] hover:translate-y-1 hover:shadow-none transition-all flex justify-between items-center group mt-2">
          <div className="flex items-center gap-4">
             <div className="bg-white border-4 border-black p-2 md:p-3 rounded-xl hidden sm:block">
               <Calendar className="w-5 h-5 md:w-6 md:h-6 text-black" strokeWidth={2.5}/>
             </div>
             <div>
               <h3 className="font-space-grotesk font-black text-lg md:text-xl uppercase">Detail Laporan {isAdmin ? 'Lengkap' : 'Pribadi'}</h3>
               <p className="font-inter font-bold text-gray-400 text-xs md:text-sm">Riwayat transaksi & komparasi</p>
             </div>
          </div>
          <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-[#FFD100] transform group-hover:translate-x-2 transition-transform" strokeWidth={3}/>
       </Link>

       {isAdmin && inventoryMode !== 'OFF' && lowStockItems.length > 0 && (
         <div className="bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-4 md:p-6 rounded-2xl md:rounded-[2rem] mt-2">
            <div className="flex items-center gap-3 mb-4">
               <div className="bg-red-500 border-4 border-black p-2 rounded-xl w-max">
                 <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />
               </div>
               <h3 className="font-space-grotesk font-black text-xl uppercase text-red-500 tracking-widest">Peringatan: Stok Menipis</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {lowStockItems.map(item => (
                <div key={item.id} className="border-2 border-black rounded-xl p-3 flex justify-between items-center hover:bg-gray-50 gap-2">
                   <div className="min-w-0 flex-1">
                      <p className="font-inter font-bold text-sm truncate">{item.name}</p>
                      <p className="font-space-grotesk font-black text-xs text-gray-500 uppercase">{item.unit}</p>
                   </div>
                   <div className="bg-red-100 px-3 py-1 border-2 border-red-500 rounded-lg shrink-0">
                      <p className="font-mono font-black text-red-600">{item.currentStock}</p>
                   </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <Link href="/backoffice/purchase-orders" className="text-sm font-black uppercase underline decoration-2 underline-offset-4 hover:text-red-600 transition-colors">
                + Buat Purchase Order
              </Link>
            </div>
         </div>
       )}
    </div>
  )
}
