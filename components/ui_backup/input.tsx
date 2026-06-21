import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border-4 border-black bg-white px-4 py-2 text-base transition-all outline-none font-inter font-bold placeholder:font-normal placeholder:text-gray-400 focus-visible:shadow-[4px_4px_0_0_#000] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
