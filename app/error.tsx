'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex bg-[#FFFDF7] h-screen w-full flex-col items-center justify-center space-y-4 text-center p-6">
      <h2 className="text-4xl font-space-grotesk font-black uppercase text-black">Terjadi Kesalahan</h2>
      <p className="text-red-500 font-mono text-sm max-w-xl overflow-hidden text-ellipsis whitespace-nowrap">{error.message || 'Unknown error'}</p>
      <button onClick={() => reset()} className="px-6 py-3 border-4 border-black bg-black text-white font-black uppercase hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)] transition-all">
        COBA LAGI
      </button>
    </div>
  );
}
