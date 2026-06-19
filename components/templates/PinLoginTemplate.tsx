'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Coffee, ArrowRight, User, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

export function PinLoginTemplate() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { login } = useAuthStore();

  useEffect(() => {
    const cachedUser = localStorage.getItem('pos_cached_username');
    if (cachedUser) {
      setTimeout(() => {
        setUsername(cachedUser);
        setRememberMe(true);
      }, 0);
    }
  }, []);
  
  // Timer for cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTime) {
      interval = setInterval(() => {
        const remaining = Math.ceil((cooldownTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setCooldownTime(null);
          setFailedAttempts(0);
          setError('');
          setTimeLeft(0);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTime]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cooldownTime) return;
    
    setError('');
    
    if (!username) {
      setError('USERNAME WAJIB DIISI');
      setPin('');
      return;
    }
    if (pin.length < 4) {
      setError('PIN MINIMAL 4 DIGIT');
      return;
    }

    const success = login(username, pin);
    if (success) {
       if (rememberMe) {
         localStorage.setItem('pos_cached_username', username);
       } else {
         localStorage.removeItem('pos_cached_username');
       }
       toast.success('Login berhasil!');
       router.push('/shift');
    } else {
       const newAttempts = failedAttempts + 1;
       setFailedAttempts(newAttempts);
       
       if (newAttempts >= 3) {
         setCooldownTime(Date.now() + 3 * 60 * 1000); // 3 minutes
         setTimeLeft(3 * 60);
         setError('AKUN TERKUNCI. TUNGGU 3 MENIT.');
       } else {
         setError('PIN ATAU USERNAME SALAH!');
       }
       setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-center items-center p-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
      
      {/* Branding Header Area */}
      <div className="mb-8 text-center flex flex-col items-center gap-3">
        <div className="bg-[#FFD100] border-4 border-black p-4 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-max transform -rotate-2">
           <Coffee className="w-12 h-12 text-black" strokeWidth={2.5} />
        </div>
        <h1 className="font-space-grotesk font-black text-4xl md:text-5xl uppercase tracking-tight text-black mt-2">
           NYAMAN COFFEE
        </h1>
        <p className="font-space-grotesk font-bold text-gray-500 uppercase tracking-widest text-sm bg-white border-2 border-black px-4 py-1 rounded-full shadow-[2px_2px_0_0_#000]">
           Point of Sale Terminal
        </p>
      </div>

      <div className="w-full max-w-md bg-white border-8 border-black rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="font-space-grotesk font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <User className="w-4 h-4" /> Username Sistem
            </Label>
            <Input 
              id="username"
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              disabled={!!cooldownTime}
              placeholder="Contoh: hanif_kasir" 
              className="h-14 font-inter text-lg font-bold border-4 border-black rounded-xl bg-gray-50 focus:bg-white shadow-[4px_4px_0_0_#000] focus:shadow-none focus:translate-y-1 transition-all"
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pin" className="font-space-grotesk font-black uppercase tracking-widest text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> KODE PIN (MIN 4 DIGIT)
            </Label>
            <Input 
              id="pin"
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
              disabled={!!cooldownTime}
              placeholder="****" 
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="current-password"
              className="h-14 font-black tracking-[1rem] text-2xl text-center border-4 border-black rounded-xl bg-gray-50 focus:bg-white shadow-[4px_4px_0_0_#000] focus:shadow-none focus:translate-y-1 transition-all placeholder:tracking-normal placeholder:font-inter placeholder:text-base placeholder:text-left placeholder:pl-4"
            />
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 border-4 border-black p-3 rounded-xl mt-1">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-2 border-black data-[state=checked]:bg-[#FFD100] data-[state=checked]:text-black w-6 h-6 rounded"
            />
            <label
              htmlFor="remember"
              className="text-sm font-space-grotesk font-black leading-none uppercase cursor-pointer"
            >
              Simpan Username di perangkat ini
            </label>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="font-space-grotesk font-black text-white bg-red-500 border-4 border-black p-3 rounded-xl text-xs tracking-widest uppercase text-center mt-2 shadow-[4px_4px_0_0_#000]"
              >
                {error}
                {cooldownTime && (
                  <span className="block mt-1 font-mono text-base">
                    {timeLeft} Detik
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            type="submit" 
            disabled={!!cooldownTime}
            className="w-full h-16 text-xl bg-[#00E5FF] text-black hover:bg-cyan-400 font-space-grotesk font-black uppercase tracking-widest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none active:translate-y-2 transition-all flex items-center justify-center gap-2 mt-2 disabled:bg-gray-300 disabled:shadow-none disabled:translate-y-1"
          >
            Masuk <ArrowRight className="w-6 h-6" />
          </Button>
        </form>
      </div>
      
      <div className="mt-8 font-space-grotesk font-black uppercase text-sm text-gray-500 tracking-widest">
        Ver 1.1 Live Production
      </div>
    </div>
  );
}
