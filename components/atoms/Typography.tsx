import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface TitleProps extends Omit<HTMLMotionProps<"h1">, "children"> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
}

export function Title({ className, as = 'h1', children, ...props }: TitleProps) {
  const Component = as;
  
  const baseClasses = "font-space-grotesk font-black uppercase tracking-tight text-black";
  
  const sizeClasses = {
    h1: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
    h2: "text-4xl sm:text-5xl md:text-6xl",
    h3: "text-3xl sm:text-4xl md:text-5xl",
    h4: "text-2xl sm:text-3xl md:text-4xl",
    h5: "text-xl sm:text-2xl md:text-3xl",
    h6: "text-lg sm:text-xl md:text-2xl",
  };

  return (
    <motion.div className={cn(baseClasses, sizeClasses[as], className)} {...props}>
      <Component className="inherit-all">{children}</Component>
    </motion.div>
  );
}

interface TextProps extends HTMLMotionProps<"p"> {
  variant?: 'body' | 'lead' | 'small' | 'caption';
}

export function Text({ className, variant = 'body', children, ...props }: TextProps) {
  const baseClasses = "font-inter text-gray-800";
  
  const sizeClasses = {
    body: "text-base md:text-lg",
    lead: "text-xl md:text-2xl font-medium",
    small: "text-sm",
    caption: "text-xs font-bold uppercase tracking-wider",
  };

  return (
    <motion.p className={cn(baseClasses, sizeClasses[variant], className)} {...props}>
      {children}
    </motion.p>
  );
}
