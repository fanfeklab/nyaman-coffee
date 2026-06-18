import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends React.ComponentProps<typeof motion.button> {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-space-grotesk font-bold uppercase tracking-wider rounded-xl transition-all duration-200 border-4 border-black active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#FFDE00] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE533]',
    secondary: 'bg-[#FF90E8] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFB3F0]',
    accent: 'bg-[#00E5FF] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#33EAFF]',
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-14 px-8 text-base md:text-lg',
    lg: 'h-16 px-10 text-lg md:text-xl',
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";
