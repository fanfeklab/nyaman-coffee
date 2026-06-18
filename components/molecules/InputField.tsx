import React from 'react';
import { Label } from '../atoms/Label';
import { Input, InputProps } from '../atoms/Input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface InputFieldProps extends InputProps {
  label: string;
  error?: string;
  containerClassName?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, containerClassName, id, className, ...props }, ref) => {
    const inputId = id || Array.from({length: 8}, () => Math.random().toString(36)[2]).join('');
    
    return (
      <div className={cn("flex flex-col gap-2 w-full", containerClassName)}>
        <Label htmlFor={inputId}>{label}</Label>
        <Input 
          id={inputId} 
          ref={ref} 
          className={cn(error && "border-red-500 focus-visible:border-red-500", className)}
          {...props} 
        />
        <AnimatePresence>
          {error && (
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-sm font-bold mt-1"
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
InputField.displayName = "InputField";
