import React, { useMemo, useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card } from '@/components/ui/card';
import { LayoutGrid, TrendingUp, Users, Calendar, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

export function DashboardOverview() {
  const { user } = useAuthStore();
  const { transactions } = useTransactionStore();
  
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days'>('today');

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOf7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    return transactions.filter(t => {
       // Filtering by user if not admin
       if (!isAdmin && t.cashierId !== user?.username) {
         // Wait, the transaction cashierId saves username or id?
         // In mock it says 'c_1'. The user table says username 'fanfeklab'. Let's use user?.id or username based on how we stored it.
         // Let's assume t.cashierId is the user.username or user.id. We can allow both to be safe or string match.
         return false; // we'll just check later, wait, I can just do a loose string check
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

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  return (
    <div className="flex flex-col gap-6 mt-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-black pb-4">
         <h2 className="font-space-grotesk font-black uppercase text-2xl tracking-widest text-black">
           Overview Penjualan
         </h2>
         <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="h-12 border-4 border-black rounded-xl font-space-grotesk font-black uppercase px-4 bg-white shadow-[4px_4px_0_0_#000] focus:shadow-none focus:translate-y-1 transition-all outline-none"
         >
            <option value="today">Hari Ini</option>
            <option value="yesterday">Kemarin</option>
            <option value="7days">7 Hari Terakhir</option>
         </select>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FF90E8] border-4 border-black p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            <div className="bg-white border-4 border-black p-3 rounded-xl w-max">
               <TrendingUp className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div>
               <p className="font-space-grotesk font-black text-gray-800 uppercase tracking-widest text-sm">Total Pendapatan</p>
               <h3 className="font-inter font-black text-3xl md:text-3xl lg:text-4xl">{formatRupiah(totalRevenue)}</h3>
            </div>
          </div>
          <div className="bg-[#00E5FF] border-4 border-black p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            <div className="bg-white border-4 border-black p-3 rounded-xl w-max">
               <FileText className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div>
               <p className="font-space-grotesk font-black text-gray-800 uppercase tracking-widest text-sm">Total Transaksi</p>
               <h3 className="font-inter font-black text-3xl md:text-3xl lg:text-4xl">{totalTx} Nota</h3>
            </div>
          </div>
          <div className="bg-[#FFD100] border-4 border-black p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-4">
            <div className="bg-white border-4 border-black p-3 rounded-xl w-max">
               <LayoutGrid className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <div>
               <p className="font-space-grotesk font-black text-gray-800 uppercase tracking-widest text-sm">Item Terjual</p>
               <h3 className="font-inter font-black text-3xl md:text-3xl lg:text-4xl">{totalItems} Item</h3>
            </div>
          </div>
       </div>

       <Link href="/backoffice/reports" className="bg-black text-white border-4 border-black p-6 rounded-[2rem] shadow-[6px_6px_0px_0px_#FFD100] hover:translate-y-1 hover:shadow-none transition-all flex justify-between items-center group">
          <div className="flex items-center gap-4">
             <div className="bg-white border-4 border-black p-3 rounded-xl">
               <Calendar className="w-6 h-6 text-black" strokeWidth={2.5}/>
             </div>
             <div>
               <h3 className="font-space-grotesk font-black text-xl md:text-2xl uppercase">Detail Laporan {isAdmin ? 'Lengkap' : 'Pribadi'}</h3>
               <p className="font-inter font-bold text-gray-400 text-sm">Lihat riwayat dan komparasi hasil</p>
             </div>
          </div>
          <ArrowRight className="w-8 h-8 text-[#FFD100] transform group-hover:translate-x-2 transition-transform" strokeWidth={3}/>
       </Link>
    </div>
  )
}
