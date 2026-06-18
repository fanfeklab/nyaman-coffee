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
import { Ban, Search, FileText, TrendingUp, Users, PackageOpen, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Product } from '@/store/useInventoryStore';

const formatRupiah = (val: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

export default function ReportsPage() {
  const router = useRouter();
  const { transactions, voidTransaction } = useTransactionStore();
  const { revertCheckoutInventory } = useInventoryStore();
  const { user } = useAuthStore();
  const { currentShift, subtractSalesFromShift } = useShiftStore();

  const [activeTab, setActiveTab] = useState<'RINGKASAN' | 'HISTORI' | 'KASIR'>('RINGKASAN');

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'MANAGER') {
       router.replace('/pos');
       toast.error('Akses ditolak: Anda tidak memiliki izin ke halaman ini');
    }
  }, [user, router]);

  const [search, setSearch] = useState('');
  const [voidConfirmId, setVoidConfirmId] = useState<string | null>(null);
  const [adminPin, setAdminPin] = useState('');

  const completedTransactions = transactions.filter(t => t.status === 'COMPLETED');
  const voidTransactions = transactions.filter(t => t.status === 'VOID');

  const filteredData = transactions.filter(tx => 
    tx.id.toLowerCase().includes(search.toLowerCase()) || 
    tx.cashierId.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.total, 0);

  // Calculate bestsellers
  const bestsellers = useMemo(() => {
    const counts: Record<string, { product: Product, qty: number, revenue: number }> = {};
    completedTransactions.forEach(tx => {
      tx.items.forEach(item => {
        if (!counts[item.product.id]) {
          counts[item.product.id] = { product: item.product, qty: 0, revenue: 0 };
        }
        counts[item.product.id].qty += item.qty;
        counts[item.product.id].revenue += item.qty * item.product.basePrice;
      });
    });
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 5); // top 5
  }, [completedTransactions]);

  // Chart data
  const chartData = useMemo(() => {
    const data = completedTransactions.reduce((acc, tx) => {
      const d = new Date(tx.timestamp);
      // Group by date (simplified for mock data, using dd/MM format)
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (!acc[key]) acc[key] = { label: key, Total: 0 };
      acc[key].Total += tx.total;
      return acc;
    }, {} as Record<string, any>);
    return Object.values(data);
  }, [completedTransactions]);

  // Cashier performances
  const cashierData = useMemo(() => {
    const perf: Record<string, { name: string, totalTx: number, revenue: number }> = {};
    completedTransactions.forEach(tx => {
      if (!perf[tx.cashierId]) perf[tx.cashierId] = { name: tx.cashierId, totalTx: 0, revenue: 0 };
      perf[tx.cashierId].totalTx += 1;
      perf[tx.cashierId].revenue += tx.total;
    });
    return Object.values(perf).sort((a, b) => b.revenue - a.revenue);
  }, [completedTransactions]);

  const handleVoid = () => {
    // Basic mock validation for PIN admin
    if (adminPin !== '1235' && adminPin !== '1111' && adminPin !== '5555') {
       toast.error('PIN Admin salah / tidak dikenali!');
       return;
    }

    if (!voidConfirmId) return;
    const tx = transactions.find(t => t.id === voidConfirmId);
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

  const handleExportCSV = () => {
    toast.success('Mengunduh laporan Laporan_Penjualan.csv ...');
    // Implement standard CSv blob here
  };

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6 h-full overflow-y-auto hide-scrollbar bg-[#FFFDF7]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
           <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black">Analitik & Laporan</h1>
           <p className="font-inter font-bold text-gray-500">Pantau performa bisnis dan pergerakan transaksi.</p>
         </div>
         <Button onClick={handleExportCSV} className="h-12 border-4 border-black bg-[#FFD100] text-black hover:bg-yellow-400 font-space-grotesk font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
           <Download className="w-5 h-5 mr-2" /> Export CSV
         </Button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 shrink-0">
        <button 
          onClick={() => setActiveTab('RINGKASAN')}
          className={cn("px-6 py-3 border-4 border-black rounded-xl font-space-grotesk font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none whitespace-nowrap", activeTab === 'RINGKASAN' ? "bg-black text-white" : "bg-white text-black")}
        >
          <TrendingUp className="w-5 h-5 inline-block mr-2" /> Ringkasan
        </button>
        <button 
          onClick={() => setActiveTab('HISTORI')}
          className={cn("px-6 py-3 border-4 border-black rounded-xl font-space-grotesk font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none whitespace-nowrap", activeTab === 'HISTORI' ? "bg-black text-white" : "bg-white text-black")}
        >
          <FileText className="w-5 h-5 inline-block mr-2" /> Histori Transaksi
        </button>
        <button 
          onClick={() => setActiveTab('KASIR')}
          className={cn("px-6 py-3 border-4 border-black rounded-xl font-space-grotesk font-black uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none whitespace-nowrap", activeTab === 'KASIR' ? "bg-black text-white" : "bg-white text-black")}
        >
          <Users className="w-5 h-5 inline-block mr-2" /> Performa Kasir
        </button>
      </div>

      {activeTab === 'RINGKASAN' && (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-[#00E5FF] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-space-grotesk font-black uppercase text-black/70 text-sm">Total Gross Revenue</span>
                <div className="text-3xl lg:text-4xl font-black text-black mt-2">{formatRupiah(totalRevenue)}</div>
             </div>
             <div className="bg-[#FF90E8] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-space-grotesk font-black uppercase text-black/70 text-sm">Total Transaksi</span>
                <div className="text-3xl lg:text-4xl font-black text-black mt-2">{completedTransactions.length} <span className="text-xl">sukses</span></div>
             </div>
             <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-space-grotesk font-black uppercase text-gray-500 text-sm">Void / Batal</span>
                <div className="text-3xl lg:text-4xl font-black text-red-500 mt-2">{voidTransactions.length} <span className="text-xl">void</span></div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 lg:col-span-2">
               <h2 className="font-space-grotesk font-black text-xl uppercase mb-6">Trend Pendapatan Harian</h2>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                       <XAxis dataKey="label" stroke="#000" tick={{fontFamily: 'Inter', fontWeight: 700}} axisLine={{strokeWidth: 2}} tickLine={false} />
                       <YAxis stroke="#000" tick={{fontFamily: 'Inter', fontWeight: 700}} axisLine={false} tickLine={false} tickFormatter={(val) => `Rp ${val/1000}k`}/>
                       <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{border: '4px solid black', borderRadius: '12px', fontWeight: 'bold', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'}} />
                       <Bar dataKey="Total" fill="#FFD100" stroke="#000" strokeWidth={4} radius={[8, 8, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
               <h2 className="font-space-grotesk font-black text-xl uppercase mb-6 flex items-center gap-2"><PackageOpen className="w-6 h-6"/> Bestsellers (Top 5)</h2>
               <div className="flex flex-col gap-4">
                 {bestsellers.length === 0 ? (
                    <div className="text-gray-500 font-bold text-center py-10 border-4 border-dashed border-gray-300 rounded-xl">Belum ada data</div>
                 ) : (
                    bestsellers.map((item, idx) => (
                      <div key={item.product.id} className="flex justify-between items-center bg-gray-50 border-2 border-black p-3 rounded-xl border-b-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center bg-black text-white font-black rounded-md">{idx + 1}</div>
                          <div className="flex flex-col">
                            <span className="font-bold uppercase text-sm">{item.product.name}</span>
                            <span className="text-xs text-gray-500 font-bold">{item.qty} terjual</span>
                          </div>
                        </div>
                        <span className="font-black text-[#FF6321]">{formatRupiah(item.revenue)}</span>
                      </div>
                    ))
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'HISTORI' && (
        <div className="bg-white border-4 border-black rounded-[2rem] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <div className="flex justify-between items-center mb-6">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  placeholder="Cari ID transaksi atau Kasir..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-black"
                />
             </div>
           </div>

           <div className="overflow-x-auto border-4 border-black rounded-xl">
              <Table>
                 <TableHeader className="bg-gray-100 border-b-4 border-black font-space-grotesk font-black uppercase text-base">
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
                        <TableCell className="text-right border-r-2 border-gray-200 text-[#FF6321] text-lg">{formatRupiah(tx.total)}</TableCell>
                        <TableCell className="text-center border-r-2 border-gray-200">
                          <span className={`px-3 py-1 font-black uppercase border-2 border-black rounded-md ${tx.status === 'COMPLETED' ? 'bg-green-200' : 'bg-red-200'}`}>
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
      )}

      {activeTab === 'KASIR' && (
        <div className="bg-white border-4 border-black rounded-[2rem] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <h2 className="font-space-grotesk font-black text-xl uppercase mb-6 flex items-center gap-2">Rekapitulasi Per Kasir</h2>

           <div className="overflow-x-auto border-4 border-black rounded-xl">
              <Table>
                 <TableHeader className="bg-gray-100 border-b-4 border-black font-space-grotesk font-black uppercase text-base">
                   <TableRow>
                     <TableHead className="text-black border-r-2 border-black">Kasir ID</TableHead>
                     <TableHead className="text-black border-r-2 border-black text-center">Total Transaksi</TableHead>
                     <TableHead className="text-black border-r-2 border-black text-right">Pendapatan Dihasilkan</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody className="font-inter font-bold">
                   {cashierData.map(cd => (
                      <TableRow key={cd.name} className="border-b-2 border-gray-200 hover:bg-gray-50">
                        <TableCell className="border-r-2 border-gray-200 uppercase">{cd.name}</TableCell>
                        <TableCell className="border-r-2 border-gray-200 text-center">{cd.totalTx} tx</TableCell>
                        <TableCell className="text-right border-r-2 border-gray-200 text-[#FF6321] text-lg">{formatRupiah(cd.revenue)}</TableCell>
                      </TableRow>
                   ))}
                   
                   {cashierData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center text-gray-500 font-space-grotesk tracking-widest uppercase">
                          Belum ada data kasir.
                        </TableCell>
                      </TableRow>
                   )}
                 </TableBody>
              </Table>
           </div>
        </div>
      )}
      
      <Dialog open={!!voidConfirmId} onOpenChange={(open) => !open && setVoidConfirmId(null)}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-[#FFFDF7] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-3xl uppercase text-red-600">Otorisasi Void</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 py-4">
              <div className="bg-red-100 border-4 border-red-600 p-4 rounded-xl">
                <p className="font-inter font-bold text-red-800">
                  ⚠️ Peringatan: Transaksi yang divoid tidak dapat dikembalikan. Stok terpotong akan direstore ke inventori.
                </p>
              </div>
              <p className="font-inter font-bold text-black text-center mt-2">
                 Masukkan PIN Otorisasi (Manager/Admin):
              </p>
              <div className="flex flex-col gap-2">
                 <Input 
                   type="password"
                   maxLength={4} 
                   value={adminPin} 
                   onChange={e => setAdminPin(e.target.value.replace(/\D/g, ''))} 
                   placeholder="****" 
                   className="text-center text-4xl tracking-[2rem] h-20 font-black border-4 border-black rounded-2xl bg-white"
                 />
              </div>
           </div>
           <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
             <Button variant="outline" className="w-full h-14 text-xl font-black uppercase border-4 border-black" onClick={() => { setVoidConfirmId(null); setAdminPin(''); }}>Batal</Button>
             <Button onClick={handleVoid} className="w-full h-14 text-xl font-black uppercase border-4 border-black bg-red-600 text-white hover:bg-red-700">VOID SEKARANG</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

