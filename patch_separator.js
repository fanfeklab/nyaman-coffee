const fs = require('fs');
let content = fs.readFileSync('components/ui/separator.tsx', 'utf8');

content = content.replace(
  'shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
  'shrink-0 bg-black data-horizontal:h-[2px] data-horizontal:w-full data-vertical:w-[2px] data-vertical:self-stretch'
);

fs.writeFileSync('components/ui/separator.tsx', content);
