'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useShiftStore } from '@/store/useShiftStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ShiftPage() {
  const { user } = useAuthStore();
  const { currentShift, openShift, closeShift } = useShiftStore();
  
  const [startingCash, setStartingCash] = useState('');
  const [actualCash, setActualCash] = useState('');

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amount = parseInt(startingCash);
    if (!isNaN(amount) && amount >= 0) {
      openShift(user.id, amount);
    }
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(actualCash);
    if (!isNaN(amount) && amount >= 0) {
      closeShift(amount);
    }
  };

  const formatRupiah = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  if (currentShift?.status === 'OPEN') {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto flex flex-col gap-8">
         <div className="bg-[#FFD100] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="font-space-grotesk font-black text-3xl uppercase tracking-widest text-black mb-2">Shift Aktif</h1>
            <p className="font-inter font-bold text-black/80">Kasir: {user?.fullName}</p>
            <p className="font-inter font-bold text-black/80">Waktu Buka: {currentShift.startTime.toLocaleTimeString()}</p>
         </div>

         <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-space-grotesk font-black text-xl text-black mb-4 uppercase">Tutup Shift Laci</h2>
            <form onSubmit={handleCloseShift} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                 <Label>Uang Fisik Laci Saat Ini (Blind Close)</Label>
                 <Input 
                   type="number" 
                   value={actualCash} 
                   onChange={(e) => setActualCash(e.target.value)} 
                   placeholder="Contoh: 150000"
                 />
                 <small className="font-inter font-bold text-gray-500">Hitung total uang tunai yang ada di dalam laci kasir sekarang.</small>
              </div>
              <Button type="submit" variant="destructive" className="w-full">
                 TUTUP SHIFT
              </Button>
            </form>
         </div>
      </div>
    );
  }

  if (currentShift?.status === 'CLOSED') {
     const selisih = currentShift.actualEndingCash - currentShift.expectedEndingCash;
     
     return (
       <div className="p-6 md:p-12 max-w-2xl mx-auto flex flex-col gap-8">
          <div className="bg-[#00E5FF] border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             <h1 className="font-space-grotesk font-black text-3xl uppercase tracking-widest text-black mb-2">Laporan Akhir Shift</h1>
             <p className="font-inter font-bold text-black border-b-4 border-black pb-4 mb-4">Shift telah ditutup. Laci berhasil dikunci.</p>
             
             <div className="flex flex-col gap-2 font-inter font-bold">
               <div className="flex justify-between"><span>Modal Awal:</span> <span>{formatRupiah(currentShift.startingCash)}</span></div>
               <div className="flex justify-between"><span>Estimasi Akhir (Sistem):</span> <span>{formatRupiah(currentShift.expectedEndingCash)}</span></div>
               <div className="flex justify-between"><span>Aktual Uang Fisik:</span> <span>{formatRupiah(currentShift.actualEndingCash)}</span></div>
               <div className="flex justify-between pt-2 mt-2 border-t border-black border-dashed">
                 <span>Selisih:</span> 
                 <span className={selisih >= 0 ? "text-green-700" : "text-red-600"}>
                    {selisih > 0 ? "+" : ""}{formatRupiah(selisih)}
                 </span>
               </div>
             </div>

             <Button className="w-full mt-6" onClick={() => window.location.reload()}>KEMBALI KE LOGIN</Button>
          </div>
       </div>
     );
  }

  // default: NO OPEN SHIFT
  return (
    <div className="p-6 md:p-12 max-w-xl mx-auto flex flex-col gap-8 mt-12">
       <div className="bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-space-grotesk font-black text-3xl uppercase tracking-widest text-black mb-2">Buka Laci / Shift Baru</h1>
          <p className="font-inter font-bold text-gray-600 mb-6 font-sm">Masukkan modal uang kembalian untuk memulai shift.</p>
          <form onSubmit={handleOpenShift} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
               <Label>Modal Awal (Tunai)</Label>
               <Input 
                 type="number" 
                 value={startingCash} 
                 onChange={(e) => setStartingCash(e.target.value)} 
                 placeholder="Contoh: 50000"
               />
               <small className="font-inter font-bold text-gray-500">Nilai fisik uang modal sebelum transaksi dimulai.</small>
            </div>
            <Button type="submit" className="w-full">
               MULAI SHIFT
            </Button>
          </form>
       </div>
    </div>
  );
}
