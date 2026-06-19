import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border-4 border-black bg-clip-padding text-sm font-space-grotesk font-black uppercase whitespace-nowrap transition-all outline-none select-none focus-visible:shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:shadow-[4px_4px_0_0_#000]",
  {
    variants: {
      variant: {
        default: "bg-[#FFD100] text-black hover:bg-[#FFD100]/80",
        outline:
          "border-black bg-white hover:bg-gray-100 text-black",
        secondary:
          "bg-[#FF90E8] text-black hover:bg-[#FF90E8]/80",
        ghost:
          "border-transparent bg-transparent hover:bg-gray-100 text-black hover:shadow-none active:translate-y-0",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 focus-visible:shadow-none",
        link: "text-black underline-offset-4 hover:underline border-transparent hover:shadow-none bg-transparent active:translate-y-0",
      },
      size: {
        default:
          "h-12 gap-2 px-4 py-2",
        xs: "h-8 gap-1 rounded-md px-2 text-xs",
        sm: "h-10 gap-1.5 rounded-lg px-3 text-sm",
        lg: "h-14 gap-2 px-8 text-lg hover:shadow-[6px_6px_0_0_#000]",
        icon: "size-12",
        "icon-xs": "size-8",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
