'use client';

import React, { useState } from 'react';
import { Sidebar } from '../organisms/Sidebar';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideSidebar?: boolean; // For standalone POS screens that don't need persistent sidebar
}

export function AppLayout({ children, className, hideSidebar = false }: AppLayoutProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#FFFDF7] overflow-hidden relative">
      {!hideSidebar && (
        <React.Fragment>
           {/* Desktop Sidebar */}
           <div className="hidden lg:block shrink-0 z-20">
             <Sidebar />
           </div>
           
           {/* Mobile Topbar for Hamburger */}
           <div className="lg:hidden absolute top-0 left-0 w-full h-16 bg-white border-b-4 border-black z-30 flex items-center px-4 justify-between">
              <span className="font-space-grotesk font-black uppercase text-xl">NYAMAN POS</span>
              <button 
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} 
                className="bg-[#FFD100] p-2 border-2 border-black rounded-lg active:translate-y-1 transition-transform"
              >
                {isMobileNavOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
              </button>
           </div>

           {/* Mobile Sidebar Overlay */}
           <AnimatePresence>
             {isMobileNavOpen && (
               <React.Fragment>
                 {/* Backdrop */}
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   onClick={() => setIsMobileNavOpen(false)}
                   className="lg:hidden fixed inset-0 bg-black/50 z-40"
                 />
                 
                 {/* Drawer */}
                 <motion.div 
                   initial={{ x: '-100%' }}
                   animate={{ x: 0 }}
                   exit={{ x: '-100%' }}
                   transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                   className="lg:hidden fixed top-0 left-0 h-full w-4/5 max-w-sm z-50 shadow-2xl"
                 >
                   <Sidebar className="w-full border-r-0" onNavigate={() => setIsMobileNavOpen(false)} />
                 </motion.div>
               </React.Fragment>
             )}
           </AnimatePresence>
        </React.Fragment>
      )}

      <main className={cn("flex-grow overflow-y-auto w-full relative z-0", !hideSidebar ? "lg:pt-0 pt-16" : "", className)}>
        {children}
      </main>
    </div>
  );
}
