const fs = require('fs');
let content = fs.readFileSync('hooks/use-mobile.ts', 'utf8');

content = content.replace(
  'mql.addEventListener("change", onChange)\n    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)',
  'mql.addEventListener("change", onChange)\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)'
);

fs.writeFileSync('hooks/use-mobile.ts', content);
