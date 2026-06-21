const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf8');

if (!content.includes('TooltipProvider')) {
  content = content.replace(
    "import { Toaster } from '@/components/ui/sonner';",
    "import { Toaster } from '@/components/ui/sonner';\nimport { TooltipProvider } from '@/components/ui/tooltip';"
  );
  
  content = content.replace(
    "<SyncProvider>\n          {children}\n        </SyncProvider>",
    "<SyncProvider>\n          <TooltipProvider>\n            {children}\n          </TooltipProvider>\n        </SyncProvider>"
  );
}

fs.writeFileSync('app/layout.tsx', content);
