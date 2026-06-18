'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { PinKeypad } from '../organisms/PinKeypad';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

export function PinLoginTemplate() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const { login } = useAuthStore();
  
  // Timer for cooldown
  React.useEffect(() => {
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
    <div className="min-h-screen bg-[#FFFDF7] flex bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] p-4 lg:p-0">
      <div className="m-auto w-full max-w-5xl flex flex-col md:flex-row bg-white border-8 border-black rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* Left Branding Panel */}
        <div className="w-full md:w-1/2 bg-[#FF6321] p-12 flex flex-col justify-between border-b-8 md:border-b-0 md:border-r-8 border-black">
           <div>
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-4 border-black w-max px-4 py-2 rounded-xl mb-8 -rotate-2"
              >
                 <span className="font-space-grotesk font-black text-black tracking-widest uppercase">SandBox Mode</span>
              </motion.div>
              <h1 className="font-space-grotesk text-5xl lg:text-7xl font-black text-black leading-[0.9] uppercase mb-6">
                Mulai<br />Shift<br />Anda.
              </h1>
              <p className="font-inter font-bold text-black/80 max-w-sm text-lg">
                Masuk untuk memulai melayani pelanggan dan mencatat penjualan hari ini.
              </p>
           </div>
        </div>

        {/* Right Login Panel */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-white relative">
          <div className="w-full max-w-sm flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                 id="username"
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 disabled={!!cooldownTime}
                 placeholder="admin"
                 className="text-lg bg-[#E6F8F9]"
              />
            </div>

            <div className="flex flex-col gap-2 relative">
               <div className="flex justify-between items-center">
                 <Label>PIN Akses</Label>
                 <span className="text-xs font-bold text-gray-400">4 DIGIT</span>
               </div>
               
               {/* 4 Digit Visual indicators */}
               <div className="flex gap-4 justify-between">
                 {[0, 1, 2, 3].map((index) => (
                   <div 
                     key={index} 
                     className={cn(
                       "w-full aspect-square border-4 border-black rounded-xl flex items-center justify-center transition-all",
                       pin.length > index ? "bg-black" : (cooldownTime ? "bg-gray-200" : "bg-white")
                     )}
                   >
                     {pin.length > index && (
                        <div className="w-4 h-4 bg-[#FFD100] rounded-full" />
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
                  className="font-inter font-bold text-red-500 bg-red-100 border-2 border-red-500 p-3 rounded-lg text-sm text-center"
                >
                  {error}
                  {cooldownTime && (
                    <span className="block mt-1 font-mono text-lg">
                      {timeLeft}s
                    </span>
                  )}
                </motion.p>
              )}
            </AnimatePresence>

            <PinKeypad 
               onKeyPress={handleKeyPress}
               onDelete={handleDelete}
               className="mt-4"
               disabled={!!cooldownTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
