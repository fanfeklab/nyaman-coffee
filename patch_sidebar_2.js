const fs = require('fs');
let content = fs.readFileSync('components/ui/sidebar.tsx', 'utf8');

// Change border-r-4 to border-r-8
content = content.replace(
  'group-data-[side=left]:border-r-4 group-data-[side=right]:border-l-4 border-black',
  'group-data-[side=left]:border-r-8 group-data-[side=right]:border-l-8 border-black'
);

// Override sidebarMenuButtonVariants
// The main agent said: Override sidebarMenuButtonVariants to use "border-4 border-black p-3 rounded-xl shadow-[4px_4px_0_0_#000] font-inter font-bold uppercase transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none". Configure data-[active=true] or data-[state=open] states.

const newVariants = `const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-xl border-4 border-black p-3 text-left font-inter font-bold uppercase ring-sidebar-ring outline-hidden transition-all shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:translate-x-0.5 data-[active=true]:translate-y-0.5 data-[active=true]:shadow-none data-[active=true]:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "",
        outline:
          "bg-background",
      },
      size: {
        default: "h-12 text-sm",
        sm: "h-10 text-xs",
        lg: "h-14 text-base group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)`;

content = content.replace(/const sidebarMenuButtonVariants = cva\([\s\S]*?\)\n/m, newVariants + "\n");

fs.writeFileSync('components/ui/sidebar.tsx', content);
