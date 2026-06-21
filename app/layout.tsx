import type {Metadata} from 'next';
import { Space_Grotesk, Inter, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { SyncProvider } from '@/components/providers/SyncProvider';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'NYAMAN COFFEE SHOP - POS SYSTEM',
  description: 'Coming soon page for NYAMAN COFFEE SHOP POS and management system',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn(spaceGrotesk.variable, inter.variable, "font-sans", geist.variable)}>
      <body className="font-inter bg-[#FFFDF7] text-black min-h-screen selection:bg-cyan-300 antialiased suppressHydrationWarning">
        <SyncProvider>
          {children}
        </SyncProvider>
        <Toaster />
      </body>
    </html>
  );
}

