import type {Metadata} from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';

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
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-inter bg-[#FFFDF7] text-black min-h-screen selection:bg-cyan-300 antialiased suppressHydrationWarning">
        {children}
      </body>
    </html>
  );
}

