'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Delete } from 'lucide-react';
import { motion } from 'motion/react';

interface PinKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  className?: string;
  disabled?: boolean;
}

export function PinKeypad({ onKeyPress, onDelete, className, disabled = false }: PinKeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0'];

  return (
    <div className={cn("grid grid-cols-3 gap-3 sm:gap-4", className)}>
      {keys.map((key) => (
        <motion.button
          key={key}
          type="button"
          disabled={disabled}
          whileTap={{ scale: 0.95 }}
          onClick={() => onKeyPress(key)}
          className="aspect-square bg-white border-4 border-black rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-space-grotesk font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {key}
        </motion.button>
      ))}
      <motion.button
        type="button"
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        onClick={onDelete}
        className="aspect-square bg-[#FFD100] border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none hover:bg-[#ffe033] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-black"
      >
        <Delete className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.5} />
      </motion.button>
    </div>
  );
}
