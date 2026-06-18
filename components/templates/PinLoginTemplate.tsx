'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { PinKeypad } from '../organisms/PinKeypad';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsername(cachedUser);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRememberMe(true);
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

  const handleLogin = (currentPin: string) => {
    setError('');
    
    if (!username) {
      setError('USERNAME WAJIB DIISI');
      setPin('');
      return;
    }

    const success = login(username, currentPin);
    if (success) {
       if (rememberMe) {
         localStorage.setItem('pos_cached_username', username);
       } else {
         localStorage.removeItem('pos_cached_username');
       }
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

  const handleKeyPress = (key: string) => {
    if (cooldownTime) return;
    if (pin.length < 4) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 4) {
        handleLogin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (cooldownTime) return;
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] p-4 items-center justify-center">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white border-8 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* Left Branding Panel */}
        <div className="w-full md:w-5/12 bg-[#FF6321] p-8 flex flex-col justify-center border-b-8 md:border-b-0 md:border-r-8 border-black">
           <div>
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-4 border-black w-max px-3 py-1 rounded-lg mb-6 -rotate-2"
              >
                 <span className="font-space-grotesk font-black text-black tracking-wider uppercase text-sm">Nyaman POS</span>
              </motion.div>
              <h1 className="font-space-grotesk text-4xl lg:text-5xl font-black text-black leading-[0.9] uppercase mb-4">
                Mulai<br />Sesi<br />Kasir.
              </h1>
              <p className="font-inter font-bold text-black/80 text-sm">
                Akses terminal untuk memproses transaksi.
              </p>
           </div>
        </div>

        {/* Right Login Panel */}
        <div className="w-full md:w-7/12 p-6 lg:p-10 flex items-center justify-center bg-white">
          <div className="w-full max-w-[320px] flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="username" className="font-black uppercase text-sm">Username POS</Label>
              <Input 
                 id="username"
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 disabled={!!cooldownTime}
                 placeholder="Masukkan username"
                 className="text-base bg-[#E6F8F9] h-12 border-4 border-black"
              />
            </div>

            <div className="flex items-center space-x-2 bg-gray-50 border-2 border-black p-2 rounded-lg w-max">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-2 border-black data-[state=checked]:bg-[#FFD100] data-[state=checked]:text-black"
              />
              <label
                htmlFor="remember"
                className="text-xs font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer uppercase"
              >
                Ingat Username
              </label>
            </div>

            <div className="flex flex-col gap-2 relative">
               <div className="flex justify-between items-center">
                 <Label className="font-black uppercase text-sm">PIN Akses</Label>
                 <span className="text-[10px] font-black tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md border-2 border-transparent">4 DIGIT</span>
               </div>
               
               {/* 4 Digit Visual indicators */}
               <div className="flex gap-3 justify-between">
                 {[0, 1, 2, 3].map((index) => (
                   <div 
                     key={index} 
                     className={cn(
                       "w-full h-12 border-4 border-black rounded-xl flex items-center justify-center transition-all",
                       pin.length > index ? "bg-black" : (cooldownTime ? "bg-gray-200" : "bg-white")
                     )}
                   >
                     {pin.length > index && (
                        <div className="w-3 h-3 bg-[#FFD100] rounded-full" />
                     )}
                   </div>
                 ))}
               </div>
               {/* Hidden Actual Input */}
               <input 
                 type="password" 
                 className="hidden" 
                 value={pin}
                 readOnly 
               />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="font-inter font-black text-red-500 bg-red-100 border-4 border-red-500 p-2 rounded-lg text-xs tracking-wider uppercase text-center"
                >
                  {error}
                  {cooldownTime && (
                    <span className="block mt-1 font-mono text-base">
                      {timeLeft}s
                    </span>
                  )}
                </motion.p>
              )}
            </AnimatePresence>

            <PinKeypad 
               onKeyPress={handleKeyPress}
               onDelete={handleDelete}
               className="mt-2"
               disabled={!!cooldownTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
