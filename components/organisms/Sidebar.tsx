import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Coffee, LayoutGrid, PackageOpen, PieChart, CheckSquare, Settings, LogOut, ChevronRight, Users, Search } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => {
    if (path === '/pos') return pathname === '/pos' || pathname.startsWith('/pos/');
    if (path === '/shift') return pathname === '/shift' || pathname.startsWith('/shift/');
    if (path === '/backoffice/products') return pathname.startsWith('/backoffice/products');
    if (path === '/backoffice/inventory') return pathname.startsWith('/backoffice/inventory');
    if (path === '/backoffice/reports') return pathname.startsWith('/backoffice/reports');
    if (path === '/backoffice/settings') return pathname.startsWith('/backoffice/settings');
    return pathname === path;
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
        
        <Link href="/pos" onClick={onNavigate} className={cn("border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group", isActive('/pos') ? "bg-black text-white" : "bg-white text-black")}>
          <div className="flex items-center gap-3">
            <LayoutGrid className={cn("w-5 h-5", isActive('/pos') ? "text-white" : "text-black")} strokeWidth={2.5}/>
            <span className={cn("font-inter font-bold uppercase tracking-wider", isActive('/pos') ? "text-white" : "text-black")}>Terminal Kasir</span>
          </div>
          <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity", isActive('/pos') ? "text-white" : "text-black")} strokeWidth={3}/>
        </Link>
        
        <Link href="/shift" onClick={onNavigate} className={cn("border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2", isActive('/shift') ? "bg-black text-white" : "bg-[#FF90E8] text-black")}>
          <div className="flex items-center gap-3">
            <CheckSquare className={cn("w-5 h-5", isActive('/shift') ? "text-white" : "text-black")} strokeWidth={2.5}/>
            <span className={cn("font-inter font-bold uppercase tracking-wider", isActive('/shift') ? "text-white" : "text-black")}>Manajemen Shift</span>
          </div>
        </Link>

        <span className="font-space-grotesk text-xs font-black uppercase tracking-widest text-black mt-6 mb-2 opacity-60">Backoffice</span>
        
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') && (
          <>
            <Link href="/backoffice/products" onClick={onNavigate} className={cn("border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group", isActive('/backoffice/products') ? "bg-black text-white" : "bg-white text-black")}>
              <div className="flex items-center gap-3">
                <Coffee className={cn("w-5 h-5", isActive('/backoffice/products') ? "text-white" : "text-black")} strokeWidth={2.5}/>
                <span className={cn("font-inter font-bold uppercase tracking-wider", isActive('/backoffice/products') ? "text-white" : "text-black")}>Master Produk</span>
              </div>
            </Link>

            <Link href="/backoffice/inventory" onClick={onNavigate} className={cn("border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2", isActive('/backoffice/inventory') ? "bg-black text-white" : "bg-white text-black")}>
              <div className="flex items-center gap-3">
                <PackageOpen className={cn("w-5 h-5", isActive('/backoffice/inventory') ? "text-white" : "text-black")} strokeWidth={2.5}/>
                <span className={cn("font-inter font-bold uppercase tracking-wider", isActive('/backoffice/inventory') ? "text-white" : "text-black")}>Bahan Baku</span>
              </div>
            </Link>

            <Link href="/backoffice/users" onClick={onNavigate} className={cn("border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2", isActive('/backoffice/users') ? "bg-black text-white" : "bg-white text-black")}>
              <div className="flex items-center gap-3">
                <Users className={cn("w-5 h-5", isActive('/backoffice/users') ? "text-white" : "text-black")} strokeWidth={2.5}/>
                <span className={cn("font-inter font-bold uppercase tracking-wider", isActive('/backoffice/users') ? "text-white" : "text-black")}>Karyawan</span>
              </div>
            </Link>

            <Link href="/backoffice/customers" onClick={onNavigate} className={cn("border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2", isActive('/backoffice/customers') ? "bg-black text-white" : "bg-white text-black")}>
              <div className="flex items-center gap-3">
                <Users className={cn("w-5 h-5", isActive('/backoffice/customers') ? "text-white" : "text-black")} strokeWidth={2.5}/>
                <span className={cn("font-inter font-bold uppercase tracking-wider", isActive('/backoffice/customers') ? "text-white" : "text-black")}>Pelanggan</span>
              </div>
            </Link>

            {user?.role === 'SUPER_ADMIN' && (
              <Link href="/backoffice/audit" onClick={onNavigate} className={cn("border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2", isActive('/backoffice/audit') ? "bg-black text-white" : "bg-white text-black")}>
                <div className="flex items-center gap-3">
                  <Search className={cn("w-5 h-5", isActive('/backoffice/audit') ? "text-white" : "text-black")} strokeWidth={2.5}/>
                  <span className={cn("font-inter font-bold uppercase tracking-wider", isActive('/backoffice/audit') ? "text-white" : "text-black")}>Audit Trails</span>
                </div>
              </Link>
            )}
          </>
        )}

        <Link href="/backoffice/reports" onClick={onNavigate} className={cn("border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2", isActive('/backoffice/reports') ? "bg-black text-white" : "bg-white text-black")}>
          <div className="flex items-center gap-3">
            <PieChart className={cn("w-5 h-5", isActive('/backoffice/reports') ? "text-white" : "text-black")} strokeWidth={2.5}/>
            <span className={cn("font-inter font-bold uppercase tracking-wider", isActive('/backoffice/reports') ? "text-white" : "text-black")}>Laporan</span>
          </div>
        </Link>
        
        {(user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER') && (
          <Link href="/backoffice/settings" onClick={onNavigate} className={cn("border-4 border-black p-3 rounded-xl flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all group mt-2", isActive('/backoffice/settings') ? "bg-black text-white" : "bg-white text-black")}>
            <div className="flex items-center gap-3">
              <Settings className={cn("w-5 h-5", isActive('/backoffice/settings') ? "text-white" : "text-black")} strokeWidth={2.5}/>
              <span className={cn("font-inter font-bold uppercase tracking-wider", isActive('/backoffice/settings') ? "text-white" : "text-black")}>Pengaturan</span>
            </div>
          </Link>
        )}

      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t-8 border-black bg-white flex items-center justify-between">
         <Link href="/profile" onClick={onNavigate} className="flex flex-col hover:bg-gray-100 p-2 rounded-lg transition-colors flex-grow mr-2">
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
