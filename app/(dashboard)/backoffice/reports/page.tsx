'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useShiftStore } from '@/store/useShiftStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ban, Search, FileText } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

export default function ReportsPage() {
  const router = useRouter();
  const { transactions, voidTransaction } = useTransactionStore();
  const { revertCheckoutInventory } = useInventoryStore();
  const { user } = useAuthStore();
  const { currentShift, subtractSalesFromShift, shiftHistory } = useShiftStore();

  const [activeTab, setActiveTab] = useState<'penjualan' | 'shift' | 'analitik'>('penjualan');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | 'all'>('today');
  const [voidConfirmId, setVoidConfirmId] = useState<string | null>(null);
  const [adminPin, setAdminPin] = useState('');

  const visibleTransactions = useMemo(() => {
    let txs = transactions;
    if (user?.role === 'CASHIER') {
      txs = txs.filter(t => t.cashierId === user.id);
    }
    
    // Apply Date Filter
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const startOf7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    if (dateFilter !== 'all') {
       txs = txs.filter(t => {
          const tDate = new Date(t.timestamp);
          if (dateFilter === 'today') return tDate >= startOfToday;
          if (dateFilter === 'yesterday') return tDate >= startOfYesterday && tDate < startOfToday;
          if (dateFilter === '7days') return tDate >= startOf7Days;
          return true;
       });
    }

    return txs;
  }, [transactions, user, dateFilter]);

  const filteredData = visibleTransactions.filter(tx => 
    tx.id.toLowerCase().includes(search.toLowerCase()) || 
    tx.cashierId.toLowerCase().includes(search.toLowerCase()) ||
    (tx.customerName || '').toLowerCase().includes(search.toLowerCase())
  );

  const completedTxs = visibleTransactions.filter(t => t.status === 'COMPLETED');
  const voidedTxs = visibleTransactions.filter(t => t.status === 'VOID');

  const totalRevenue = completedTxs.reduce((sum, t) => sum + t.total, 0);
  const cashRevenue = completedTxs.filter(t => t.paymentMethod === 'TUNAI').reduce((sum, t) => sum + t.total, 0);
  const qrisRevenue = completedTxs.filter(t => t.paymentMethod === 'QRIS').reduce((sum, t) => sum + t.total, 0);
  const voidRevenue = voidedTxs.reduce((sum, t) => sum + t.total, 0);

  const handleVoid = () => {
    // Basic mock validation for PIN admin
    if (adminPin !== '1235' && adminPin !== '1111' && adminPin !== '5555') {
       toast.error('PIN Admin salah / tidak dikenali!');
       return;
    }

    if (!voidConfirmId) return;
    const tx = visibleTransactions.find(t => t.id === voidConfirmId);
    if (!tx) return;
    
    // revert inventory
    revertCheckoutInventory(tx.items.map(i => ({ productId: i.product.id, qty: i.qty })));
    
    // void
    voidTransaction(voidConfirmId);
    
    // subtract from current shift if applicable
    if (currentShift?.id === tx.shiftId) {
       subtractSalesFromShift(tx.total);
    }

    toast.success('Transaksi berhasil di-void (dibatalkan). Stok dikembalikan.');
    setVoidConfirmId(null);
    setAdminPin('');
  };

  const { products } = useInventoryStore();

  const productAnalytics = useMemo(() => {
    const stats: Record<string, { name: string, soldQty: number, revenue: number }> = {};
    products.forEach(p => {
      stats[p.id] = { name: p.name, soldQty: 0, revenue: 0 };
    });

    visibleTransactions.filter(t => t.status === 'COMPLETED').forEach(tx => {
      tx.items.forEach(item => {
        if (stats[item.product.id]) {
          stats[item.product.id].soldQty += item.qty;
          stats[item.product.id].revenue += (item.qty * item.product.basePrice);
        } else {
          stats[item.product.id] = { name: item.product.name, soldQty: item.qty, revenue: item.qty * item.product.basePrice };
        }
      });
    });

    return Object.values(stats).sort((a, b) => b.soldQty - a.soldQty);
  }, [visibleTransactions, products]);

  const topSelling = productAnalytics.filter(p => p.soldQty > 0);
  const unsellable = productAnalytics.filter(p => p.soldQty === 0);

  const handleExportCSV = () => {
    if (visibleTransactions.length === 0) {
      toast.error('Tidak ada transaksi untuk diekspor!');
      return;
    }

    const headers = ['ID Transaksi', 'Waktu', 'Kasir', 'Pelanggan', 'Metode Bayar', 'Total', 'Status'];
    const csvContent = 
      headers.join(',') + '\\n' +
      visibleTransactions.map(tx => {
        return [
          tx.id,
          new Date(tx.timestamp).toISOString(),
          tx.cashierId,
          `"${tx.customerName || ''}"`,
          tx.paymentMethod,
          tx.total,
          tx.status
        ].join(',');
      }).join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan_penjualan_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Berhasil mengekspor Laporan Penjualan CSV');
  };

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black">Laporan Backoffice</h1>
           <p className="font-inter font-bold text-gray-500">Lihat histori seluruh transaksi, pendapatan, dan laporan shift kasir.</p>
        </div>
        <Button onClick={handleExportCSV} className="border-4 border-black font-bold uppercase hover:bg-black hover:text-white transition-colors" variant="outline">
          Export CSV (Penjualan)
        </Button>
      </div>

      <div className="flex gap-4 border-b-4 border-black pb-2 overflow-x-auto hide-scrollbar">
         <button 
           onClick={() => setActiveTab('penjualan')}
           className={`px-6 py-3 font-space-grotesk font-black uppercase tracking-widest text-lg rounded-t-2xl transition-all border-t-4 border-x-4 border-black ${activeTab === 'penjualan' ? 'bg-[#FFD100] text-black shadow-[4px_0_0_0_rgba(0,0,0,1)]' : 'bg-gray-100 text-gray-400 border-b-4 translate-y-1'}`}
         >
           LAPORAN PENJUALAN
         </button>
         <button 
           onClick={() => setActiveTab('shift')}
           className={`px-6 py-3 font-space-grotesk font-black uppercase tracking-widest text-lg rounded-t-2xl transition-all border-t-4 border-x-4 border-black ${activeTab === 'shift' ? 'bg-[#00E5FF] text-black shadow-[4px_0_0_0_rgba(0,0,0,1)]' : 'bg-gray-100 text-gray-400 border-b-4 translate-y-1'}`}
         >
           LAPORAN SHIFT
         </button>
         {user?.role !== 'CASHIER' && (
           <button 
             onClick={() => setActiveTab('analitik')}
             className={`px-6 py-3 font-space-grotesk font-black uppercase tracking-widest text-lg rounded-t-2xl transition-all border-t-4 border-x-4 border-black ${activeTab === 'analitik' ? 'bg-[#FF90E8] text-black shadow-[4px_0_0_0_rgba(0,0,0,1)]' : 'bg-gray-100 text-gray-400 border-b-4 translate-y-1'}`}
           >
             ANALITIK MENU
           </button>
         )}
      </div>

      {activeTab === 'penjualan' && (
         <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Filter Section */}
            <div className="flex border-4 border-black rounded-xl w-max overflow-hidden font-space-grotesk font-black uppercase text-sm shadow-[4px_4px_0_0_#000]">
               <button onClick={() => setDateFilter('today')} className={`px-4 py-2 border-r-4 border-black ${dateFilter === 'today' ? 'bg-[#FFD100]' : 'bg-white hover:bg-gray-100'}`}>Hari Ini</button>
               <button onClick={() => setDateFilter('yesterday')} className={`px-4 py-2 border-r-4 border-black ${dateFilter === 'yesterday' ? 'bg-[#FFD100]' : 'bg-white hover:bg-gray-100'}`}>Kemarin</button>
               <button onClick={() => setDateFilter('7days')} className={`px-4 py-2 border-r-4 border-black ${dateFilter === '7days' ? 'bg-[#FFD100]' : 'bg-white hover:bg-gray-100'}`}>7 Hari</button>
               <button onClick={() => setDateFilter('all')} className={`px-4 py-2 ${dateFilter === 'all' ? 'bg-[#FFD100]' : 'bg-white hover:bg-gray-100'}`}>Semua</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               <div className="col-span-2 bg-[#FF90E8] border-4 border-black p-4 md:p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col min-w-0">
                  <span className="font-space-grotesk font-black uppercase text-black text-xs md:text-sm px-3 py-1 bg-white border-2 border-black rounded-full w-max">Gross Revenue</span>
                  <div className="text-3xl md:text-4xl lg:text-5xl font-black text-black mt-2 leading-none truncate w-full">{formatRupiah(totalRevenue)}</div>
                  <div className="mt-4 flex flex-col sm:flex-row gap-4 pt-4 border-t-4 border-black border-dashed">
                     <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#5c3053]">Tunai Kasir</span>
                        <div className="font-inter font-black text-sm md:text-lg truncate">{formatRupiah(cashRevenue)}</div>
                     </div>
                     <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#5c3053]">Non-Tunai / QRIS</span>
                        <div className="font-inter font-black text-sm md:text-lg truncate">{formatRupiah(qrisRevenue)}</div>
                     </div>
                  </div>
               </div>
               <div className="bg-[#00E5FF] border-4 border-black p-4 md:p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <span className="font-space-grotesk font-black uppercase text-black text-xs md:text-sm px-3 py-1 bg-white border-2 border-black rounded-full w-max">Total Transaksi</span>
                  <div className="mt-4">
                     <div className="text-3xl md:text-4xl lg:text-5xl font-black text-black leading-none">{completedTxs.length}</div>
                     <div className="text-xs uppercase font-space-grotesk font-black tracking-widest mt-1">Nota Sukses</div>
                  </div>
               </div>
               <div className="bg-white border-4 border-black p-4 md:p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <span className="font-space-grotesk font-black uppercase text-red-600 text-xs md:text-sm px-3 py-1 bg-red-100 border-2 border-red-600 rounded-full w-max">Void / Batal</span>
                  <div className="mt-4">
                     <div className="text-3xl md:text-4xl lg:text-5xl font-black text-red-600 leading-none">{voidedTxs.length}</div>
                     <div className="text-xs font-bold font-inter text-gray-500 mt-1">Potensi rugi: <span className="font-black text-black">{formatRupiah(voidRevenue)}</span></div>
                  </div>
               </div>
            </div>

      <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
         <h2 className="font-space-grotesk font-black text-xl uppercase mb-4">Grafik Transaksi</h2>
         <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={
                 // Group by hour for simple chart
                 Object.values(visibleTransactions.filter(t => t.status === 'COMPLETED').reduce((acc, tx) => {
                   const d = new Date(tx.timestamp);
                   const key = `${d.getHours()}:00`;
                   if (!acc[key]) acc[key] = { label: key, Total: 0 };
                   acc[key].Total += tx.total;
                   return acc;
                 }, {} as Record<string, any>))
               }>
                 <XAxis dataKey="label" stroke="#000" tick={{fontFamily: 'Inter', fontWeight: 700}}/>
                 <YAxis stroke="#000" tick={{fontFamily: 'Inter', fontWeight: 700}} tickFormatter={(val) => `Rp ${val/1000}k`}/>
                 <Tooltip contentStyle={{border: '4px solid black', borderRadius: '12px', fontWeight: 'bold'}} />
                 <Bar dataKey="Total" fill="#FFD100" stroke="#000" strokeWidth={3} radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
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
                   <TableHead className="text-black border-r-2 border-black">Pelanggan</TableHead>
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
                      <TableCell className="border-r-2 border-gray-200 uppercase text-xs">{tx.customerName || '-'}</TableCell>
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
         </div>
      )}

      {activeTab === 'shift' && (
         <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden">
               <h2 className="font-space-grotesk font-black text-xl uppercase mb-4 px-2">Histori Sesi Shift</h2>
               <div className="overflow-x-auto border-4 border-black rounded-xl">
                  <Table>
                     <TableHeader className="bg-gray-100 border-b-4 border-black font-space-grotesk font-black uppercase text-xs">
                       <TableRow>
                         <TableHead className="text-black border-r-2 border-black w-[50px]">Status</TableHead>
                         <TableHead className="text-black border-r-2 border-black min-w-[120px]">Kasir</TableHead>
                         <TableHead className="text-black border-r-2 border-black min-w-[200px]">Waktu</TableHead>
                         <TableHead className="text-black border-r-2 border-black text-right min-w-[150px]">Modal Awal</TableHead>
                         <TableHead className="text-black border-r-2 border-black text-right min-w-[150px]">Sistem (Estimasi)</TableHead>
                         <TableHead className="text-black border-r-2 border-black text-right min-w-[150px]">Fisik Laci</TableHead>
                         <TableHead className="text-black text-right min-w-[150px]">Selisih</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody className="font-inter font-bold">
                       {currentShift && (
                          <TableRow className="border-b-2 border-gray-200 bg-[#E0FFFF] hover:bg-cyan-50">
                            <TableCell className="border-r-2 border-gray-200">
                               <span className="px-2 py-1 text-xs border-2 border-black rounded-md bg-[#00E5FF] font-black">OPEN</span>
                            </TableCell>
                            <TableCell className="border-r-2 border-gray-200 uppercase">{currentShift.cashierId}</TableCell>
                            <TableCell className="border-r-2 border-gray-200">
                               {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(currentShift.startTime))} - <span className="opacity-50">Sekarang</span>
                            </TableCell>
                            <TableCell className="text-right border-r-2 border-gray-200">{formatRupiah(currentShift.startingCash)}</TableCell>
                            <TableCell className="text-right border-r-2 border-gray-200">{formatRupiah(currentShift.expectedEndingCash)}</TableCell>
                            <TableCell className="text-right border-r-2 border-gray-200">-</TableCell>
                            <TableCell className="text-right">-</TableCell>
                          </TableRow>
                       )}
                       {shiftHistory.map((shift, idx) => {
                          const selisih = shift.actualEndingCash - shift.expectedEndingCash;
                          return (
                            <TableRow key={shift.id || idx} className="border-b-2 border-gray-200 hover:bg-gray-50">
                              <TableCell className="border-r-2 border-gray-200">
                                 <span className="px-2 py-1 text-xs border-2 border-black rounded-md bg-gray-200">{shift.status}</span>
                              </TableCell>
                              <TableCell className="border-r-2 border-gray-200 uppercase">{shift.cashierId}</TableCell>
                              <TableCell className="border-r-2 border-gray-200 text-xs text-gray-600">
                                 {new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(shift.startTime))}
                                 {' - '}
                                 {shift.endTime ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(shift.endTime)) : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right border-r-2 border-gray-200">{formatRupiah(shift.startingCash)}</TableCell>
                              <TableCell className="text-right border-r-2 border-gray-200">{formatRupiah(shift.expectedEndingCash)}</TableCell>
                              <TableCell className="text-right border-r-2 border-gray-200">{formatRupiah(shift.actualEndingCash)}</TableCell>
                              <TableCell className="text-right">
                                 <span className={cn("px-2 py-1 rounded-md border-2 border-black uppercase text-xs", selisih < 0 ? "bg-red-400 text-white" : selisih > 0 ? "bg-green-400 text-black" : "bg-white")}>
                                   {selisih > 0 ? '+' : ''}{formatRupiah(selisih)}
                                 </span>
                              </TableCell>
                            </TableRow>
                          );
                       })}
                       {shiftHistory.length === 0 && !currentShift && (
                          <TableRow>
                             <TableCell colSpan={7} className="h-32 text-center text-gray-500 font-space-grotesk tracking-widest uppercase">
                               Tidak ada histori shift.
                             </TableCell>
                          </TableRow>
                       )}
                     </TableBody>
                  </Table>
               </div>
            </div>
         </div>
      )}

      {activeTab === 'analitik' && (
         <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden">
               <h2 className="font-space-grotesk font-black text-xl uppercase mb-4 px-2">Menu Paling Laku (Top Selling)</h2>
               <div className="overflow-x-auto border-4 border-black rounded-xl">
                  <Table>
                     <TableHeader className="bg-gray-100 border-b-4 border-black font-space-grotesk font-black uppercase text-xs">
                       <TableRow>
                         <TableHead className="text-black border-r-2 border-black">Nama Menu</TableHead>
                         <TableHead className="text-black border-r-2 border-black text-center w-[150px]">Terjual (Qty)</TableHead>
                         <TableHead className="text-black text-right w-[200px]">Total Pendapatan</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody className="font-inter font-bold">
                       {topSelling.map((item, idx) => (
                          <TableRow key={idx} className="border-b-2 border-gray-200 hover:bg-gray-50">
                            <TableCell className="border-r-2 border-gray-200">{item.name}</TableCell>
                            <TableCell className="border-r-2 border-gray-200 text-center text-[#FF6321] text-lg">{item.soldQty}</TableCell>
                            <TableCell className="text-right text-black">{formatRupiah(item.revenue)}</TableCell>
                          </TableRow>
                       ))}
                       {topSelling.length === 0 && (
                          <TableRow>
                             <TableCell colSpan={3} className="h-32 text-center text-gray-500 font-space-grotesk tracking-widest uppercase">
                               Belum ada data penjualan.
                             </TableCell>
                          </TableRow>
                       )}
                     </TableBody>
                  </Table>
               </div>
            </div>

            <div className="bg-[#FF90E8] border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden">
               <h2 className="font-space-grotesk font-black text-xl uppercase mb-4 px-2">Menu Tidak Pernah Laku</h2>
               <div className="flex flex-wrap gap-2">
                 {unsellable.map((item, idx) => (
                   <span key={idx} className="px-4 py-2 border-2 border-black bg-white rounded-lg font-space-grotesk font-black uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                     {item.name}
                   </span>
                 ))}
                 {unsellable.length === 0 && (
                    <span className="font-inter font-bold text-black border-2 border-black p-4 rounded-xl bg-white w-full">Semua menu laku terjual sejauh ini! ✨</span>
                 )}
               </div>
            </div>
         </div>
      )}
      
      <Dialog open={!!voidConfirmId} onOpenChange={(open) => !open && setVoidConfirmId(null)}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase text-red-600">Otorisasi Void</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 py-4">
              <p className="font-inter font-bold text-sm text-gray-500">
                 Transaksi akan dibatalkan, nominal dikurangi dari total, dan stok bahan baku akan dikembalikan.
                 <strong>Masukkan PIN Manager/Admin untuk menyetujui pembatalan.</strong>
              </p>
              <div className="flex flex-col gap-2">
                 <Input 
                   type="password"
                   maxLength={4} 
                   value={adminPin} 
                   onChange={e => setAdminPin(e.target.value.replace(/\D/g, ''))} 
                   placeholder="PIN 4 Digit" 
                   className="text-center text-2xl tracking-widest h-14 font-black"
                 />
              </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => { setVoidConfirmId(null); setAdminPin(''); }}>Batal</Button>
             <Button onClick={handleVoid} className="bg-red-600 text-white hover:bg-red-700">VOID TRANSAKSI</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
