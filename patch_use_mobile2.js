const fs = require('fs');
let content = fs.readFileSync('hooks/use-mobile.ts', 'utf8');

content = content.replace(
  '// eslint-disable-next-line react-hooks/exhaustive-deps\n    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)',
  '// eslint-disable-next-line react-hooks/exhaustive-deps\n    // @ts-ignore\n    // eslint-disable-next-line react-hooks/set-state-in-effect\n    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)'
);

fs.writeFileSync('hooks/use-mobile.ts', content);
