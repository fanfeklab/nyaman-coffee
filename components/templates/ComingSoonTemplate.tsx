import React from 'react';
import { ComingSoonForm } from '../organisms/ComingSoonForm';
import { Coffee, Smartphone, MenuSquare } from 'lucide-react';

export function ComingSoonTemplate() {
  return (
    <div className="min-h-screen bg-[#FFD100] flex flex-col lg:flex-row overflow-hidden font-sans md:border-[12px] border-black">
      {/* LEFT: HERO & INFO */}
      <div className="w-full lg:w-3/5 p-8 md:p-16 flex flex-col justify-between">
        <header className="flex flex-col gap-2">
          <div className="bg-white border-4 border-black px-4 py-2 w-max rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase tracking-widest text-black">POS SYSTEM - VERSION 1.0</span>
          </div>
          <h1 className="text-6xl md:text-[80px] leading-[0.85] font-black uppercase mt-4 text-black">
            Nyaman<br />
            Coffee<br />
            Shop
          </h1>
          <p className="text-lg md:text-xl font-bold mt-6 leading-tight max-w-md text-black">
            SISTEM MANAJEMEN KAFE MODERN DENGAN PENDEKATAN ATOMIC DESIGN UNTUK EFISIENSI MAKSIMAL.
          </p>
        </header>

        <div className="mt-12 lg:mt-0 flex flex-col gap-6">
          <ComingSoonForm />

          {/* Atom: TechStackBadges */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="bg-black text-white px-3 py-1 rounded text-[10px] font-bold">NEXT.JS 15</div>
            <div className="bg-black text-white px-3 py-1 rounded text-[10px] font-bold">TAILWIND V4</div>
            <div className="bg-black text-white px-3 py-1 rounded text-[10px] font-bold">RADIX UI</div>
            <div className="bg-black text-white px-3 py-1 rounded text-[10px] font-bold">SHADCN</div>
          </div>
        </div>
      </div>

      {/* RIGHT: MOBILE PREVIEW */}
      <div className="w-full lg:w-2/5 bg-[#00A19D] lg:border-l-[12px] border-t-[12px] lg:border-t-0 border-black flex items-center justify-center p-10 min-h-[600px] relative overflow-hidden">
        {/* Template: MobileInterfaceWrapper */}
        <div className="w-[320px] h-[600px] bg-white border-[6px] border-black rounded-[40px] shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative z-10">
          
          {/* Mobile Header */}
          <div className="p-6 border-b-4 border-black flex justify-between items-center bg-[#FF6321]/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase opacity-50 text-black">Welcome back,</span>
              <span className="text-sm font-black uppercase text-black">Barista #01</span>
            </div>
            <MenuSquare className="w-6 h-6 text-black" strokeWidth={3} />
          </div>

          {/* Mobile POS Grid */}
          <div className="p-4 flex-grow bg-[#FFFDF7]">
            <div className="grid grid-cols-2 gap-3">
              {/* Molecule: ProductCard */}
              <div className="aspect-square border-4 border-black rounded-2xl bg-[#FFD100] p-3 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-8 h-8 bg-white border-2 border-black rounded-lg flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-black" strokeWidth={3} />
                </div>
                <div className="font-black text-[11px] leading-none uppercase text-black">Ice Americano</div>
              </div>
              
              <div className="aspect-square border-4 border-black rounded-2xl bg-white p-3 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-2">
                <div className="w-8 h-8 bg-[#00A19D] border-2 border-black rounded-lg flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <div className="font-black text-[11px] leading-none uppercase text-black mt-auto">Cappuccino</div>
              </div>

              <div className="aspect-square border-4 border-black rounded-2xl bg-white p-3 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-2">
                <div className="w-8 h-8 bg-[#FF6321] border-2 border-black rounded-lg flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
                <div className="font-black text-[11px] leading-none uppercase text-black mt-auto">Manual Brew</div>
              </div>

              <div className="aspect-square border-4 border-black rounded-2xl bg-[#00A19D]/20 p-3 flex flex-col justify-between gap-2">
                <div className="w-8 h-8 border-2 border-black border-dashed rounded-lg bg-transparent"></div>
                <div className="font-black text-[11px] leading-none uppercase opacity-40 text-black mt-auto">NEW ITEM</div>
              </div>
            </div>
          </div>

          {/* Mobile Footer Action */}
          <div className="p-6 bg-black mt-auto">
            <div className="flex justify-between items-center text-white mb-4">
              <span className="font-black uppercase text-xs">Total Order</span>
              <span className="font-black text-lg">Rp 55.000</span>
            </div>
            <button className="w-full bg-[#FFD100] border-2 border-white py-3 rounded-xl font-black text-black uppercase text-sm tracking-widest hover:bg-[#ffe033] transition-colors">
              PROSES TRANSAKSI
            </button>
          </div>

          {/* Smartphone notch decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl"></div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-[#FF6321] border-4 border-black rounded-full animate-bounce z-0 hidden lg:block"></div>
        <div className="absolute bottom-20 right-32 w-12 h-12 bg-white border-4 border-black rotate-12 z-0 hidden lg:block"></div>
      </div>
    </div>
  );
}
