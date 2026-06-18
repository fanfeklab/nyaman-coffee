import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Coffee, LayoutGrid, PackageOpen, PieChart, CheckSquare, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className={cn("w-64 md:w-72 bg-[#00A19D] border-r-8 border-black flex flex-col h-screen", className)}>
      {/* Brand */}
      <div className="p-6 border-b-8 border-black flex flex-col gap-1 bg-[#FFD100]">
        <h1 className="font-space-grotesk text-3xl font-black uppercase text-black leading-none">NYAMAN<br/>POS</h1>
        <p className="font-space-grotesk text-xs font-black uppercase tracking-widest text-black bg-white px-2 py-1 border-2 border-black w-max mt-2">v1.0 (Sandbox)</p>
      </div>

      {/* Nav Menu */}
      <nav className="flex-grow p-4 flex flex-col gap-2 overflow-y-auto">
        <span className="font-space-grotesk text-xs font-black uppercase tracking-widest text-black mb-2 opacity-60">Operasional</span>
        
        <Link href="/pos" className="bg-white border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-black" strokeWidth={2.5}/>
            <span className="font-inter font-bold text-black uppercase tracking-wider">Terminal Kasir</span>
          </div>
          <ChevronRight className="w-4 h-4 text-black opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3}/>
        </Link>
        
        <Link href="/shift" className="bg-[#FF90E8] border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-black" strokeWidth={2.5}/>
            <span className="font-inter font-bold text-black uppercase tracking-wider">Manajemen Shift</span>
          </div>
        </Link>

        <span className="font-space-grotesk text-xs font-black uppercase tracking-widest text-black mt-6 mb-2 opacity-60">Backoffice</span>
        
        <Link href="/backoffice/products" className="bg-white border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group">
          <div className="flex items-center gap-3">
            <Coffee className="w-5 h-5 text-black" strokeWidth={2.5}/>
            <span className="font-inter font-bold text-black uppercase tracking-wider">Master Produk</span>
          </div>
        </Link>

        <Link href="/backoffice/inventory" className="bg-white border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2">
          <div className="flex items-center gap-3">
            <PackageOpen className="w-5 h-5 text-black" strokeWidth={2.5}/>
            <span className="font-inter font-bold text-black uppercase tracking-wider">Bahan Baku</span>
          </div>
        </Link>

        <Link href="/backoffice/reports" className="bg-white border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2">
          <div className="flex items-center gap-3">
            <PieChart className="w-5 h-5 text-black" strokeWidth={2.5}/>
            <span className="font-inter font-bold text-black uppercase tracking-wider">Laporan</span>
          </div>
        </Link>
        
        <Link href="/backoffice/settings" className="bg-white border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-black" strokeWidth={2.5}/>
            <span className="font-inter font-bold text-black uppercase tracking-wider">Pengaturan</span>
          </div>
        </Link>

      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t-8 border-black bg-white flex items-center justify-between">
         <Link href="/profile" className="flex flex-col hover:bg-gray-100 p-2 rounded-lg transition-colors flex-grow mr-2">
           <span className="font-space-grotesk text-xs font-black uppercase text-gray-500">{user?.role || 'KASIR'} AKTIF</span>
           <span className="font-inter font-black text-black leading-tight line-clamp-1">{user?.fullName || 'Guest'}</span>
         </Link>
         <button onClick={handleLogout} className="p-3 bg-[#FF6321] border-4 border-black rounded-xl text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex-shrink-0">
           <LogOut className="w-5 h-5" strokeWidth={2.5} />
         </button>
      </div>
    </aside>
  );
}
