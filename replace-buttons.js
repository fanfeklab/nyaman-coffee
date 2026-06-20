const fs = require('fs');
const files = [
  'app/(dashboard)/pos/page.tsx',
  'app/(dashboard)/backoffice/inventory/page.tsx',
  'app/(dashboard)/backoffice/reports/page.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/<button /g, '<Button ');
  content = content.replace(/<button>/g, '<Button>');
  content = content.replace(/<\/button>/g, '</Button>');
  
  if (!content.includes("import { Button }")) {
    content = content.replace("import React", "import { Button } from '@/components/ui/button';\nimport React");
  }
  
  fs.writeFileSync(file, content);
}
console.log('Replaced button tags');
