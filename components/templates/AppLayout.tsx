import React from 'react';
import { Sidebar } from '../organisms/Sidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideSidebar?: boolean; // For standalone POS screens that don't need persistent sidebar
}

export function AppLayout({ children, className, hideSidebar = false }: AppLayoutProps) {
  // We'll manage mobile sidebar state later via Zustand, for now it's responsive.
  return (
    <div className="flex h-screen w-full bg-[#FFFDF7] overflow-hidden">
      {!hideSidebar && (
        <React.Fragment>
           {/* Desktop Sidebar */}
           <div className="hidden lg:block shrink-0 z-20">
             <Sidebar />
           </div>
           
           {/* Mobile Topbar for Hamburger (Very basic for now) */}
           <div className="lg:hidden absolute top-0 w-full h-16 bg-white border-b-4 border-black z-10 flex items-center px-4 justify-between">
              <span className="font-space-grotesk font-black uppercase text-xl">NYAMAN POS</span>
              <button className="bg-[#FFD100] p-2 border-2 border-black rounded-lg">
                <Menu className="w-6 h-6 text-black" />
              </button>
           </div>
        </React.Fragment>
      )}

      <main className={cn("flex-grow overflow-y-auto w-full relative z-0", !hideSidebar ? "lg:pt-0 pt-16" : "", className)}>
        {children}
      </main>
    </div>
  );
}
