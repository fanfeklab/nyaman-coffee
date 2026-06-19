'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useShiftStore } from '@/store/useShiftStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LayoutGrid, Coffee, PieChart, PackageOpen, ArrowRight, User, Clock, Wallet, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { DashboardOverview } from '@/components/organisms/DashboardOverview';

export default function ShiftPage() {
  const { user, users } = useAuthStore();
  const { currentShift, openShift, closeShift, forceCloseShift } = useShiftStore();
  
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';
  const shiftCashier = currentShift ? users.find(u => u.id === currentShift.cashierId) : null;
  
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
      <div className="p-4 md:p-8 flex flex-col gap-6 h-full overflow-y-auto bg-[#FFFDF7] hide-scrollbar">
         {/* BENTO GRID LAYOUT */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
            {/* 1. PROFILE & SHIFT INFO CARD (Bento Left) */}
            <div className="lg:col-span-1 bg-[#FFD100] border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
               <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-4 border-black rounded-full overflow-hidden shrink-0 shadow-[4px_4px_0_0_#000]">
                       <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${shiftCashier?.username || 'user'}&backgroundColor=ffffff`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-space-grotesk font-black uppercase text-2xl text-black leading-none">{shiftCashier?.fullName || 'Sistem'}</p>
                      <p className="font-inter font-bold text-black/70 text-sm mt-1 uppercase">Kasir Aktif</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border-4 border-black font-inter font-bold">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-black" />
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Waktu Mulai</span>
                        <span className="text-black">{new Date(currentShift.startTime).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Wallet className="w-5 h-5 text-black" />
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Modal Laci Awal</span>
                        <span className="text-black">{formatRupiah(currentShift.startingCash)}</span>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="mt-8">
                 {isAdmin ? (
                   <Button onClick={() => {
                      if(window.confirm('Anda yakin ingin menutup shift ini secara paksa? Laporan akan disesuaikan otomatis.')) {
                        forceCloseShift(currentShift.id);
                        window.location.reload();
                      }
                   }} variant="outline" className="w-full h-14 bg-red-500 hover:bg-red-600 text-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none active:translate-y-2 uppercase font-space-grotesk font-black text-lg">
                      FORCE END SHIFT
                   </Button>
                 ) : (
                   <Button onClick={() => setConfirmClose(true)} variant="outline" className="w-full h-14 bg-white hover:bg-gray-100 text-red-500 hover:text-red-600 border-4 border-black shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none active:translate-y-2 uppercase font-space-grotesk font-black text-lg">
                      AKHIRI SHIFT KASIR
                   </Button>
                 )}
               </div>
            </div>

            {/* 2. SHORTCUTS & ACTIONS (Bento Right) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
               <h2 className="font-space-grotesk font-black uppercase text-xl md:text-2xl tracking-widest text-black">Akses Cepat</h2>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Action Card: POS */}
                  <Link href="/pos" className="bg-[#00E5FF] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex flex-col items-center justify-center gap-2 group aspect-square">
                     <div className="bg-white border-4 border-black p-3 rounded-xl w-max shadow-[2px_2px_0_0_#000] group-hover:scale-110 transition-transform">
                       <LayoutGrid className="w-8 h-8 text-black" strokeWidth={2.5}/>
                     </div>
                     <span className="font-space-grotesk font-black text-sm md:text-base uppercase text-center mt-2 leading-tight">POS<br/>Kasir</span>
                  </Link>
                  
                  {/* Action Card: Laporan */}
                  <Link href="/backoffice/reports" className="bg-[#FF90E8] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex flex-col items-center justify-center gap-2 group aspect-square">
                     <div className="bg-white border-4 border-black p-3 rounded-xl w-max shadow-[2px_2px_0_0_#000] group-hover:scale-110 transition-transform">
                       <CheckCircle2 className="w-8 h-8 text-black" strokeWidth={2.5}/>
                     </div>
                     <span className="font-space-grotesk font-black text-sm md:text-base uppercase text-center mt-2 leading-tight">Riwayat<br/>Transaksi</span>
                  </Link>

                  {isAdmin && (
                    <Link href="/backoffice" className="bg-[#FFD100] border-4 border-black p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex flex-col items-center justify-center gap-2 group aspect-square">
                       <div className="bg-white border-4 border-black p-3 rounded-xl w-max shadow-[2px_2px_0_0_#000] group-hover:scale-110 transition-transform">
                         <PieChart className="w-8 h-8 text-black" strokeWidth={2.5}/>
                       </div>
                       <span className="font-space-grotesk font-black text-sm md:text-base uppercase text-center mt-2 leading-tight">Back<br/>Office</span>
                    </Link>
                  )}
               </div>
            </div>
         </div>

         <DashboardOverview />

         {/* END SHIFT DIALOG MODAL (Clean, no form on dashboard itself) */}
         <ConfirmDialog 
           open={confirmClose}
           onOpenChange={setConfirmClose}
           onConfirm={handleCloseShift}
           title="Akhiri Sesi Shift?"
           confirmLabel="Tutup Laci"
           cancelLabel="Batal"
           description={(
              <div className="flex flex-col gap-4 mt-4 text-left">
                 <p className="font-inter font-bold text-gray-600">Hitung total uang fisik tunai yang ada di dalam laci kasir sekarang secara cermat (Blind Close).</p>
                 <div className="flex flex-col gap-2">
                    <Label className="text-black uppercase font-black uppercase text-xs tracking-widest">Fisik Laci</Label>
                    <Input 
                      type="text" 
                      value={actualCash ? new Intl.NumberFormat('id-ID').format(parseInt(actualCash.replace(/\D/g, ''))) : ''} 
                      onChange={(e) => setActualCash(e.target.value.replace(/\D/g, ''))} 
                      placeholder="Rp 0"
                      className="h-16 text-3xl font-black text-black border-4 border-black rounded-xl text-center shadow-[4px_4px_0_0_#000] mb-2"
                      inputMode="numeric"
                      autoFocus
                    />
                 </div>
                 <div className="bg-red-100 p-4 border-2 border-red-500 rounded-xl">
                    <p className="font-inter font-bold text-red-600 text-xs text-center">Tindakan ini akan mengunci terminal kasir dan mencetak laporan akhir shift. Tindakan ini tidak dapat dibatalkan.</p>
                 </div>
              </div>
           ) as any}
         />
      </div>
    );
  }

  if (currentShift?.status === 'CLOSED') {
     const selisih = currentShift.actualEndingCash - currentShift.expectedEndingCash;
     
     return (
       <div className="p-4 md:p-12 flex flex-col h-full bg-[#FFFDF7] items-center justify-center">
          <div className="bg-white border-8 border-black p-6 md:p-10 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full">
             <div className="flex justify-center mb-6">
                <div className="bg-[#FFD100] border-4 border-black p-4 rounded-full shadow-[4px_4px_0_0_#000]">
                   <CheckCircle2 className="w-12 h-12 text-black" strokeWidth={3} />
                </div>
             </div>
             <h1 className="font-space-grotesk font-black text-3xl uppercase tracking-widest text-black text-center mb-2">Shift Selesai</h1>
             <p className="font-inter font-bold text-gray-500 text-center mb-8">Laporan akhir shift Anda telah disimpan.</p>
             
             <div className="flex flex-col gap-3 font-inter font-bold bg-gray-50 p-6 rounded-2xl border-4 border-black">
               <div className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-3">
                 <span className="text-gray-500 uppercase text-xs tracking-widest">Modal Awal</span> 
                 <span className="text-lg">{formatRupiah(currentShift.startingCash)}</span>
               </div>
               <div className="flex justify-between items-center border-b-2 border-dashed border-gray-300 py-3">
                 <span className="text-gray-500 uppercase text-xs tracking-widest">Sistem (Estimasi)</span> 
                 <span className="text-lg">{formatRupiah(currentShift.expectedEndingCash)}</span>
               </div>
               <div className="flex justify-between items-center border-b-2 border-dashed border-gray-300 py-3">
                 <span className="text-gray-500 uppercase text-xs tracking-widest">Fisik Laci (Aktual)</span> 
                 <span className="text-lg font-black">{formatRupiah(currentShift.actualEndingCash)}</span>
               </div>
               <div className={`flex justify-between items-center p-4 rounded-xl border-4 border-black mt-3 font-black uppercase text-xl ${selisih < 0 ? 'bg-red-500 text-white shadow-[4px_4px_0_0_#000]' : 'bg-[#00E5FF] text-black shadow-[4px_4px_0_0_#000]'}`}>
                 <span>Selisih</span> 
                 <span>
                    {selisih > 0 ? "+" : ""}{formatRupiah(selisih)}
                 </span>
               </div>
             </div>

             <Button className="w-full mt-8 h-16 text-xl font-space-grotesk font-black tracking-widest uppercase border-4 border-black bg-[#FF6321] hover:bg-[#ff7a40] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all text-white" onClick={() => window.location.reload()}>
               KEMBALI KE LOGIN
             </Button>
          </div>
       </div>
     );
  }

  // default: NO OPEN SHIFT
  if (isAdmin) {
    return (
      <div className="p-6 md:p-12 flex flex-col h-full bg-[#FFFDF7] items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
         <div className="bg-white border-8 border-black p-8 md:p-12 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full flex flex-col items-center">
            
            <div className="w-20 h-20 bg-gray-100 border-4 border-black rounded-full overflow-hidden shrink-0 shadow-[4px_4px_0_0_#000] mb-6 flex items-center justify-center">
               <span className="font-space-grotesk font-black text-4xl text-gray-400">?</span>
            </div>

            <h1 className="font-space-grotesk font-black text-2xl md:text-3xl uppercase tracking-widest text-black mb-2 text-center">Tidak Ada Shift Aktif</h1>
            <p className="font-inter font-bold text-gray-500 text-center mb-8">Saat ini tidak ada kasir yang sedang membuka shift. Anda tidak dapat melakukan transaksi.</p>
         </div>

         <div className="w-full mt-8 max-w-5xl">
            <DashboardOverview />
         </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 flex flex-col h-full bg-[#FFFDF7] items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
       <div className="bg-white border-8 border-black p-8 md:p-12 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full flex flex-col items-center">
          
          <div className="w-20 h-20 bg-gray-100 border-4 border-black rounded-full overflow-hidden shrink-0 shadow-[4px_4px_0_0_#000] mb-6">
             <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.username}&backgroundColor=ffffff`} alt="Avatar" className="w-full h-full object-cover" />
          </div>

          <h1 className="font-space-grotesk font-black text-3xl md:text-4xl uppercase tracking-widest text-black mb-2 text-center">Mulai Shift</h1>
          <p className="font-inter font-bold text-gray-500 text-center mb-8">Halo <span className="text-black uppercase">{user?.fullName}</span>, siapkan modal kembalian laci.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); setConfirmOpen(true); }} className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
               <Label className="text-xs uppercase font-black text-gray-500 tracking-widest text-center">Modal Uang Tunai Awal (Rp)</Label>
               <Input 
                 type="text" 
                 value={startingCash ? new Intl.NumberFormat('id-ID').format(parseInt(startingCash.replace(/\D/g, ''))) : ''} 
                 onChange={(e) => setStartingCash(e.target.value.replace(/\D/g, ''))} 
                 placeholder="0"
                 className="h-16 text-3xl font-black border-4 border-black shadow-[4px_4px_0_0_#000] text-center rounded-xl bg-gray-50 focus:bg-white"
                 inputMode="numeric"
               />
               <small className="font-inter font-bold text-gray-400 mt-2 text-center text-xs">Pastikan fisik lembaran uang sesuai.</small>
            </div>
            
            <Button type="submit" className="w-full mt-4 h-16 text-xl bg-[#00E5FF] text-black hover:bg-cyan-400 font-space-grotesk font-black uppercase tracking-widest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none active:translate-y-2 transition-all">
               BUKA KASIR
            </Button>
          </form>
       </div>

       <div className="w-full mt-8 max-w-5xl">
          <DashboardOverview />
       </div>

       <ConfirmDialog 
         open={confirmOpen}
         onOpenChange={setConfirmOpen}
         onConfirm={handleOpenShift}
         title="Buka Shift?"
         confirmLabel="Buka Shift"
         cancelLabel="Batal"
         description={(
            <div className="flex flex-col gap-2 mt-4 text-left font-inter font-bold border-4 border-black p-4 rounded-xl bg-gray-50">
               <div className="flex justify-between">
                 <span className="text-gray-500 uppercase text-xs">Kasir</span>
                 <span className="text-black uppercase text-sm">{user?.fullName}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-500 uppercase text-xs">Modal Laci</span>
                 <span className="text-black text-sm">{formatRupiah(parseInt(startingCash.replace(/\D/g, '')) || 0)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-500 uppercase text-xs">Waktu</span>
                 <span className="text-black text-sm">{new Date().toLocaleTimeString()}</span>
               </div>
            </div>
         ) as any}
       />
    </div>
  );
}

