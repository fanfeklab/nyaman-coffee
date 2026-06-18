'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useShiftStore } from '@/store/useShiftStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LayoutGrid, Coffee, PieChart, PackageOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ShiftPage() {
  const { user } = useAuthStore();
  const { currentShift, openShift, closeShift } = useShiftStore();
  
  const [startingCash, setStartingCash] = useState('');
  const [actualCash, setActualCash] = useState('');
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const handleOpenShift = () => {
    if (!user) return;
    const amount = parseInt(startingCash.replace(/\D/g, ''));
    if (!isNaN(amount) && amount >= 0) {
      openShift(user.id, amount);
      setConfirmOpen(false);
    }
  };

  const handleCloseShift = () => {
    const amount = parseInt(actualCash.replace(/\D/g, ''));
    if (!isNaN(amount) && amount >= 0) {
      closeShift(amount);
      setConfirmClose(false);
    }
  };

  const formatRupiah = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  if (currentShift?.status === 'OPEN') {
    return (
      <div className="p-4 md:p-8 flex flex-col gap-8 h-full overflow-y-auto bg-[#FFFDF7] hide-scrollbar">
         <div className="flex flex-col gap-4">
           <h1 className="font-space-grotesk font-black text-3xl md:text-4xl uppercase tracking-widest text-black">Dashboard</h1>
           <div className="bg-[#FFD100] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <p className="font-space-grotesk font-black uppercase text-xl mb-1 text-black">Sesi Shift Aktif</p>
                <div className="flex flex-col md:flex-row gap-2 md:gap-6 font-inter font-bold text-black/80">
                  <span>Kasir: {user?.fullName}</span>
                  <span>Waktu Mulai: {currentShift.startTime.toLocaleTimeString()}</span>
                  <span>Modal: {formatRupiah(currentShift.startingCash)}</span>
                </div>
              </div>
           </div>
         </div>

         {/* DASHBOARD SHORTCUTS */}
         <div className="flex flex-col gap-4">
           <h2 className="font-space-grotesk font-black uppercase text-2xl">Akses Cepat</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Link href="/pos" className="bg-[#00E5FF] border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between aspect-square group">
                 <div className="bg-white border-4 border-black p-3 rounded-xl w-max">
                   <LayoutGrid className="w-8 h-8 text-black" strokeWidth={2.5}/>
                 </div>
                 <div className="flex justify-between items-end">
                   <span className="font-space-grotesk font-black text-2xl uppercase leading-tight">Terminal<br/>Kasir</span>
                   <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform"/>
                 </div>
              </Link>
              
              <Link href="/backoffice/products" className="bg-[#FF90E8] border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between aspect-square group">
                 <div className="bg-white border-4 border-black p-3 rounded-xl w-max">
                   <Coffee className="w-8 h-8 text-black" strokeWidth={2.5}/>
                 </div>
                 <div className="flex justify-between items-end">
                   <span className="font-space-grotesk font-black text-2xl uppercase leading-tight">Master<br/>Produk</span>
                   <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform"/>
                 </div>
              </Link>
              
              <Link href="/backoffice/reports" className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between aspect-square group">
                 <div className="bg-[#FFD100] border-4 border-black p-3 rounded-xl w-max">
                   <PieChart className="w-8 h-8 text-black" strokeWidth={2.5}/>
                 </div>
                 <div className="flex justify-between items-end">
                   <span className="font-space-grotesk font-black text-2xl uppercase leading-tight">Analisis<br/>Laporan</span>
                   <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-transform"/>
                 </div>
              </Link>
              
              <Link href="/backoffice/inventory" className="bg-[#FF6321] text-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between aspect-square group">
                 <div className="bg-white border-4 border-black p-3 rounded-xl w-max">
                   <PackageOpen className="w-8 h-8 text-black" strokeWidth={2.5}/>
                 </div>
                 <div className="flex justify-between items-end">
                   <span className="font-space-grotesk font-black text-2xl uppercase leading-tight">Cek Stok<br/>Bahan</span>
                   <ArrowRight className="w-6 h-6 text-white transform group-hover:translate-x-2 transition-transform"/>
                 </div>
              </Link>
           </div>
         </div>

         {/* CLOSE SHIFT FORM */}
         <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-4">
            <h2 className="font-space-grotesk font-black text-xl text-black mb-4 uppercase text-red-600">Akhiri Sesi (Tutup Shift)</h2>
            <form onSubmit={(e) => { e.preventDefault(); setConfirmClose(true); }} className="flex flex-col gap-6 max-w-xl">
              <div className="flex flex-col gap-2">
                 <Label>Uang Fisik Laci Saat Ini (Blind Close)</Label>
                 <Input 
                   type="text" 
                   value={actualCash ? new Intl.NumberFormat('id-ID').format(parseInt(actualCash.replace(/\D/g, ''))) : ''} 
                   onChange={(e) => setActualCash(e.target.value.replace(/\D/g, ''))} 
                   placeholder="Contoh: 150000"
                   className="h-12 text-lg font-bold"
                 />
                 <small className="font-inter font-bold text-gray-500">Hitung total uang fisik tunai yang ada di dalam laci kasir sekarang secara cermat sebelum ditutup.</small>
              </div>
              <Button type="submit" variant="destructive" className="w-full md:w-max px-8 h-12 text-lg font-space-grotesk font-black uppercase">
                 KUNCI LACI & TUTUP SHIFT
              </Button>
            </form>
         </div>

         <ConfirmDialog 
           open={confirmClose}
           onOpenChange={setConfirmClose}
           onConfirm={handleCloseShift}
           title="Akhiri Sesi Shift?"
           description={`Total uang dicatat: ${formatRupiah(parseInt(actualCash.replace(/\D/g, '')) || 0)}. Aksi ini akan mencatat laporan akhir shift dan mengharuskan login shift lagi.`}
         />
      </div>
    );
  }

  if (currentShift?.status === 'CLOSED') {
     const selisih = currentShift.actualEndingCash - currentShift.expectedEndingCash;
     
     return (
       <div className="p-6 md:p-12 max-w-3xl mx-auto flex flex-col gap-8 h-full justify-center">
          <div className="bg-[#00E5FF] border-4 border-black p-6 md:p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             <h1 className="font-space-grotesk font-black text-3xl uppercase tracking-widest text-black mb-2 text-center border-b-4 border-black pb-4">Laporan Akhir Shift</h1>
             
             <div className="flex flex-col gap-3 font-inter font-bold text-lg mt-6">
               <div className="flex justify-between bg-white border-2 border-black p-3 rounded-lg">
                 <span>Modal Awal:</span> 
                 <span>{formatRupiah(currentShift.startingCash)}</span>
               </div>
               <div className="flex justify-between bg-white border-2 border-black p-3 rounded-lg">
                 <span>Sistem (Estimasi Akhir):</span> 
                 <span>{formatRupiah(currentShift.expectedEndingCash)}</span>
               </div>
               <div className="flex justify-between bg-white border-2 border-black p-3 rounded-lg">
                 <span>Fisik Laci (Aktual):</span> 
                 <span>{formatRupiah(currentShift.actualEndingCash)}</span>
               </div>
               <div className={`flex justify-between p-4 rounded-xl border-4 border-black mt-4 font-black uppercase text-xl ${selisih < 0 ? 'bg-red-400 text-white' : 'bg-[#FFD100] text-black'}`}>
                 <span>Selisih (Variance):</span> 
                 <span>
                    {selisih > 0 ? "+" : ""}{formatRupiah(selisih)}
                 </span>
               </div>
             </div>

             <Button className="w-full mt-8 h-12 text-lg font-space-grotesk font-black tracking-wider uppercase border-4 border-black" onClick={() => window.location.reload()}>
               SELESAI & LOGOUT
             </Button>
          </div>
       </div>
     );
  }

  // default: NO OPEN SHIFT
  return (
    <div className="p-6 md:p-12 flex flex-col h-full items-center justify-center bg-[#FFFDF7]">
       <div className="bg-white border-8 border-black p-8 md:p-12 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full">
          <h1 className="font-space-grotesk font-black text-3xl md:text-4xl uppercase tracking-widest text-black mb-2">Buka Shift</h1>
          <p className="font-inter font-bold text-gray-600 mb-8">Halo {user?.fullName}, masukkan modal uang kembalian untuk memulai shift Anda hari ini.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true); }} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
               <Label className="text-lg">Modal Awal Laci (Tunai)</Label>
               <Input 
                 type="text" 
                 value={startingCash ? new Intl.NumberFormat('id-ID').format(parseInt(startingCash.replace(/\D/g, ''))) : ''} 
                 onChange={(e) => setStartingCash(e.target.value.replace(/\D/g, ''))} 
                 placeholder="Contoh: 100000"
                 className="h-14 text-2xl font-black"
                 inputMode="numeric"
               />
               <small className="font-inter font-bold text-gray-500 mt-1">Uang fisik yang ada di laci sebelum transaksi dimulai.</small>
            </div>
            
            <Button type="submit" className="w-full h-14 text-xl bg-[#00E5FF] text-black hover:bg-cyan-400 font-space-grotesk font-black uppercase tracking-wider border-4 border-black">
               MULAI SESI SHIFT
            </Button>
          </form>
       </div>

       <ConfirmDialog 
         open={confirmOpen}
         onOpenChange={setConfirmOpen}
         onConfirm={handleOpenShift}
         title="Konfirmasi Buka Shift"
         description={`Apakah data sudah benar?\nKasir: ${user?.fullName}\nModal: ${formatRupiah(parseInt(startingCash.replace(/\D/g, '')) || 0)}\nWaktu: ${new Date().toLocaleTimeString()}`}
       />
    </div>
  );
}
