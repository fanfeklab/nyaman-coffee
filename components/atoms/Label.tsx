import React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "font-space-grotesk text-sm md:text-base font-bold uppercase tracking-wider text-black",
          className
        )}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";
