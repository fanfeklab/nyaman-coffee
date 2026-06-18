'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCircle2 } from 'lucide-react';

export function ComingSoonForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#00E5FF] border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center gap-4 w-full"
      >
        <CheckCircle2 className="w-12 h-12 text-black" strokeWidth={2.5} />
        <h3 className="font-space-grotesk text-2xl font-black uppercase text-black">Anda Masuk Daftar!</h3>
        <p className="font-inter font-bold text-black">Kami akan memberitahu Anda saat sistem NYAMAN POS dirilis.</p>
      </motion.div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col gap-3 w-full"
    >
      <label className="text-sm font-black uppercase tracking-widest text-black flex items-center gap-2">
        <Bell className="w-4 h-4" strokeWidth={3} />
        Dapatkan Notifikasi Peluncuran
      </label>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
        <input 
          type="email" 
          placeholder="ALAMAT EMAIL ANDA" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-grow bg-white border-4 border-black p-4 rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none placeholder:text-black/40 text-black font-inter focus:translate-y-1 focus:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-[#FF6321] text-black border-4 border-black px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? 'MEMPROSES...' : 'GABUNG'}
        </button>
      </div>
    </motion.form>
  );
}
