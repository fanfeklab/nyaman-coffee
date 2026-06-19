import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex bg-[#FFFDF7] h-screen w-full flex-col items-center justify-center space-y-4 text-center">
      <h2 className="text-4xl font-space-grotesk font-black uppercase text-black">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-600 font-inter font-bold">Kode 404. Maaf, halaman yang Anda tuju tidak tersedia.</p>
      <Link href="/">
        <Button>KEMBALI KE BERANDA</Button>
      </Link>
    </div>
  );
}
