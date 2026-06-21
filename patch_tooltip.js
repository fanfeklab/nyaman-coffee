const fs = require('fs');
let content = fs.readFileSync('components/ui/tooltip.tsx', 'utf8');

content = content.replace(
  'rounded-md bg-foreground',
  'rounded-md bg-foreground border-2 border-background shadow-[4px_4px_0_0_hsl(var(--background))]'
);

fs.writeFileSync('components/ui/tooltip.tsx', content);
