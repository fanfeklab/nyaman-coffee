import React from 'react';
import Link from 'next/link';
import { ArrowRight, Coffee, Store, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] p-6">
      
      <div className="max-w-3xl text-center flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="bg-[#FFD100] border-4 border-black px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-max flex items-center gap-3">
           <Zap className="w-5 h-5" />
           <span className="font-space-grotesk font-black uppercase tracking-widest text-sm">Nyaman POS ver 1.0.0</span>
        </div>

        <p className="font-space-grotesk text-xs font-black uppercase tracking-widest text-[#FFD100] px-2 py-1 w-max mt-4">
           LIVE PRODUCTION ENVIRONMENT
        </p>

        <h1 className="font-space-grotesk font-black text-6xl md:text-8xl uppercase tracking-tight text-black leading-[0.9]">
           Nyaman <br /> <span className="text-[#FF6321] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">Coffee Shop.</span>
        </h1>

        <p className="font-inter font-bold text-gray-600 text-lg md:text-xl max-w-xl">
           Sistem Manajemen Outlet Nyaman POS Terintegrasi
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
           <Link href="/login">
             <Button className="h-16 px-10 text-xl bg-[#00E5FF] text-black hover:bg-cyan-400 font-space-grotesk font-black uppercase border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center w-full sm:w-auto">
               MASUK APLIKASI
               <ArrowRight className="ml-2 w-6 h-6" />
             </Button>
           </Link>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mt-20">
         <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex gap-4 items-start">
            <div className="bg-[#FF90E8] p-3 rounded-lg border-2 border-black">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-space-grotesk font-black text-xl uppercase mb-2">Manajemen Shift</h3>
              <p className="font-inter font-bold text-gray-600 text-sm">Amankan laci dengan tracking modal awal dan uang fisik di akhir shift.</p>
            </div>
         </div>
         <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex gap-4 items-start">
            <div className="bg-[#00E5FF] p-3 rounded-lg border-2 border-black">
              <Coffee className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-space-grotesk font-black text-xl uppercase mb-2">Kontrol Stok</h3>
              <p className="font-inter font-bold text-gray-600 text-sm">Recipe management untuk memotong bahan baku setiap transaksi (Strict/Loose).</p>
            </div>
         </div>
      </div>
      
    </div>
  );
}
