'use client';

import React, { useState, useEffect } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, TrendingDown, FileText, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { SalesReportPdf } from '@/components/pdf/SalesReportPdf';
import { useShiftStore } from '@/store/useShiftStore';
import { useInventoryStore } from '@/store/useInventoryStore';

export default function ReportsPage() {
  const { user, login } = useAuthStore();
  const { transactions, voidTransaction } = useTransactionStore();
  const { deductSalesFromShift } = useShiftStore();
  const { revertCheckoutInventory } = useInventoryStore();
  const [activeTab, setActiveTab] = useState<'MY_SALES' | 'SUPER_ADMIN'>(user?.role === 'ADMIN' ? 'SUPER_ADMIN' : 'MY_SALES');
  const [search, setSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidTargetId, setVoidTargetId] = useState<string | null>(null);
  const [adminPin, setAdminPin] = useState('');

  const formatRupiah = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  const kasirTransactions = transactions.filter(t => t.cashierId === user?.username);
  const adminTransactions = transactions.filter(t => t.id.toLowerCase().includes(search.toLowerCase()) || t.cashierId.toLowerCase().includes(search.toLowerCase()));

  const totalOmzetKasir = kasirTransactions.filter(t => t.status === 'COMPLETED').reduce((acc, t) => acc + t.subtotal, 0);
  const totalOmzetAdmin = transactions.filter(t => t.status === 'COMPLETED').reduce((acc, t) => acc + t.subtotal, 0);

  const handleOpenVoid = (id: string) => {
    setVoidTargetId(id);
    setAdminPin('');
    setVoidModalOpen(true);
  };

  const handleConfirmVoid = () => {
    if (adminPin === '1235') {
       if (voidTargetId) {
         const targetTx = transactions.find(t => t.id === voidTargetId);
         if (targetTx && targetTx.status === 'COMPLETED') {
            voidTransaction(voidTargetId);
            revertCheckoutInventory(targetTx.items.map(i => ({ product: i.product, qty: i.qty })));
            deductSalesFromShift(targetTx.subtotal);
            toast.success('Transaksi dibatalkan (VOID). Stok direstore.', { description: `Total IDR ${targetTx.subtotal} ditarik dari laporan kasir.` });
         } else {
            toast.error('Gagal void transaksi.');
         }
       }
       setVoidModalOpen(false);
    } else {
       toast.error('PIN Admin salah!');
    }
  };

  return (
    <div className="p-6 lg:p-10 flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="font-space-grotesk font-black text-4xl uppercase tracking-widest text-black">Laporan & Analitik</h1>
            <p className="font-inter font-bold text-gray-500">Monitor omzet dan performa penjualan.</p>
         </div>
         
         {user?.role === 'ADMIN' && (
           <div className="flex bg-white border-4 border-black p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('MY_SALES')}
                className={`px-6 py-2 font-space-grotesk font-black uppercase rounded-lg transition-all ${activeTab === 'MY_SALES' ? 'bg-[#FFD100] text-black border-2 border-black' : 'text-gray-500 hover:text-black'}`}
              >
                Penjualan Saya
              </button>
              <button 
                onClick={() => setActiveTab('SUPER_ADMIN')}
                className={`px-6 py-2 font-space-grotesk font-black uppercase rounded-lg transition-all ${activeTab === 'SUPER_ADMIN' ? 'bg-[#FFD100] text-black border-2 border-black' : 'text-gray-500 hover:text-black'}`}
              >
                Analytics Admin
              </button>
           </div>
         )}
      </div>

      {activeTab === 'MY_SALES' && (
        <div className="flex flex-col gap-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                 <CardHeader className="pb-2">
                    <CardTitle className="font-space-grotesk text-gray-500 uppercase text-xs tracking-widest">Total Transaksi Saya</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="font-inter font-black text-4xl text-black">{kasirTransactions.length}</div>
                 </CardContent>
              </Card>
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#00E5FF]">
                 <CardHeader className="pb-2">
                    <CardTitle className="font-space-grotesk text-black uppercase text-xs tracking-widest">Total Omzet (Selesai)</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="font-inter font-black text-4xl text-black">{formatRupiah(totalOmzetKasir)}</div>
                 </CardContent>
              </Card>
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white flex items-center justify-center">
                 <CardContent className="p-6 w-full">
                    {isMounted && (
                      <PDFDownloadLink
                        document={<SalesReportPdf transactions={kasirTransactions} title="LAPORAN PENJUALAN KASIR" totalOmzet={totalOmzetKasir} />}
                        fileName={`Laporan_Kasir_${user?.username || 'Guest'}.pdf`}
                        className="w-full"
                      >
                         {({ loading }) => (
                           <Button className="w-full font-space-grotesk font-black uppercase bg-[#FF90E8] text-black border-2 border-black hover:bg-pink-400 gap-2">
                             <FileText className="w-5 h-5"/> {loading ? 'MENYIAPKAN PDF...' : 'CETAK LAPORAN SAYA (PDF)'}
                           </Button>
                         )}
                      </PDFDownloadLink>
                    )}
                 </CardContent>
              </Card>
           </div>
        </div>
      )}

      {activeTab === 'SUPER_ADMIN' && (
         <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                 <CardHeader className="pb-2">
                    <CardTitle className="font-space-grotesk text-gray-500 uppercase text-xs tracking-widest">Total Semua Transaksi</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="font-inter font-black text-4xl text-black">{transactions.length}</div>
                 </CardContent>
              </Card>
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#FFD100]">
                 <CardHeader className="pb-2">
                    <CardTitle className="font-space-grotesk text-black uppercase text-xs tracking-widest">Global Omzet</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="font-inter font-black text-4xl text-black">{formatRupiah(totalOmzetAdmin)}</div>
                 </CardContent>
              </Card>
               <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white flex items-center justify-center">
                 <CardContent className="p-6 w-full">
                    {isMounted && (
                      <PDFDownloadLink
                        document={<SalesReportPdf transactions={transactions} title="LAPORAN PENJUALAN GLOBAL" totalOmzet={totalOmzetAdmin} />}
                        fileName={`Laporan_Global_${new Date().toISOString().split('T')[0]}.pdf`}
                        className="w-full"
                      >
                         {({ loading }) => (
                           <Button className="w-full font-space-grotesk font-black uppercase bg-[#00E5FF] text-black border-2 border-black hover:bg-cyan-400 gap-2">
                             <FileText className="w-5 h-5"/> {loading ? 'MENYIAPKAN PDF...' : 'REKAP GLOBAL (PDF)'}
                           </Button>
                         )}
                      </PDFDownloadLink>
                    )}
                 </CardContent>
              </Card>
           </div>

           <div className="bg-white border-4 border-black rounded-2xl flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 overflow-hidden mt-4">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                 <h2 className="font-space-grotesk font-black text-2xl uppercase">Daftar Transaksi Global</h2>
                 <Input 
                   className="w-full md:w-64 border-2 border-black" 
                   placeholder="Cari ID / Kasir..." 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>

              <div className="overflow-x-auto border-4 border-black rounded-xl">
                 <Table>
                    <TableHeader className="bg-gray-100 border-b-4 border-black font-space-grotesk font-black uppercase">
                      <TableRow>
                        <TableHead className="text-black border-r-2 border-black">Waktu</TableHead>
                        <TableHead className="text-black border-r-2 border-black">ID Transaksi</TableHead>
                        <TableHead className="text-black border-r-2 border-black">Kasir</TableHead>
                        <TableHead className="text-black border-r-2 border-black">Metode</TableHead>
                        <TableHead className="text-black border-r-2 border-black text-right">Subtotal</TableHead>
                        <TableHead className="text-black border-r-2 border-black text-center">Status</TableHead>
                        <TableHead className="text-right text-black w-[100px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="font-inter font-bold">
                      {adminTransactions.map(t => (
                         <TableRow key={t.id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                           <TableCell className="border-r-2 border-gray-200 text-gray-500 whitespace-nowrap">
                             {t.timestamp.toLocaleString('id-ID')}
                           </TableCell>
                           <TableCell className="border-r-2 border-gray-200">{t.id}</TableCell>
                           <TableCell className="border-r-2 border-gray-200">{t.cashierId}</TableCell>
                           <TableCell className="border-r-2 border-gray-200">{t.paymentMethod}</TableCell>
                           <TableCell className="text-right border-r-2 border-gray-200 text-[#FF6321]">{formatRupiah(t.subtotal)}</TableCell>
                           <TableCell className="border-r-2 border-gray-200 text-center">
                              <span className={`px-2 py-1 text-xs border-2 border-black rounded-md ${t.status === 'COMPLETED' ? 'bg-green-300' : 'bg-red-300'}`}>
                                 {t.status}
                              </span>
                           </TableCell>
                           <TableCell className="text-right">
                             <div className="flex justify-end gap-2">
                               <button 
                                  onClick={() => handleOpenVoid(t.id)} 
                                  className="p-2 border-2 border-black rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                                  disabled={t.status === 'VOID'}
                                  title="Void Transaksi"
                                >
                                 <Ban className="w-4 h-4"/>
                               </button>
                             </div>
                           </TableCell>
                         </TableRow>
                      ))}
                      {adminTransactions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-gray-500 font-space-grotesk">Tidak ditemukan.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                 </Table>
              </div>
           </div>
         </div>
      )}

      {/* Void Confirmation Modal */}
      <Dialog open={voidModalOpen} onOpenChange={setVoidModalOpen}>
        <DialogContent className="border-8 border-black rounded-[2rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm">
           <DialogHeader>
             <DialogTitle className="font-space-grotesk font-black text-2xl uppercase text-red-600">Otorisasi Void</DialogTitle>
           </DialogHeader>
           <div className="flex flex-col gap-4 py-4">
              <p className="font-inter font-bold text-gray-600 text-sm">Membatalkan transaksi akan mengembalikan stok bahan baku. Masukkan PIN Admin untuk melanjutkan.</p>
              <div className="flex flex-col gap-2">
                 <Label>PIN Admin</Label>
                 <Input 
                   type="password" 
                   maxLength={4} 
                   value={adminPin} 
                   onChange={e => setAdminPin(e.target.value)} 
                   placeholder="****" 
                   className="text-center text-2xl tracking-widest font-mono"
                 />
              </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setVoidModalOpen(false)}>BATAL</Button>
             <Button onClick={handleConfirmVoid} className="bg-red-500 hover:bg-red-600 text-white">VOID TRANSAKSI</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
