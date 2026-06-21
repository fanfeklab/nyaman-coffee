const fs = require('fs');
let content = fs.readFileSync('components/ui/sidebar.tsx', 'utf8');

// Replace border-r and border-l on the main sidebar container
content = content.replace(
  'group-data-[side=left]:border-r group-data-[side=right]:border-l',
  'group-data-[side=left]:border-r-4 group-data-[side=right]:border-l-4 border-black'
);

// Replace floating variant styles
content = content.replace(
  'group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border',
  'group-data-[variant=floating]:rounded-xl group-data-[variant=floating]:shadow-[4px_4px_0_0_#000] group-data-[variant=floating]:border-4 group-data-[variant=floating]:border-black'
);

// hover:after:bg-sidebar-border
content = content.replace(
  'hover:after:bg-sidebar-border',
  'hover:after:bg-black'
);

// mx-2 w-auto bg-sidebar-border
content = content.replace(
  'mx-2 w-auto bg-sidebar-border',
  'mx-2 w-auto bg-black border-2 border-black' // separator
);

// outline variant
content = content.replace(
  'bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]',
  'bg-background border-2 border-black shadow-[4px_4px_0_0_#000] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all'
);

// border-l border-sidebar-border
content = content.replace(
  'border-l border-sidebar-border',
  'border-l-4 border-black'
);

fs.writeFileSync('components/ui/sidebar.tsx', content);
