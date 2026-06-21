const fs = require('fs');
let content = fs.readFileSync('app/globals.css', 'utf8');

// Replace light mode sidebar colors with neobrutalism
content = content.replace(
  /--sidebar: oklch\(0\.985 0 0\);/,
  '--sidebar: #FFD100;'
);
content = content.replace(
  /--sidebar-foreground: oklch\(0\.145 0 0\);/,
  '--sidebar-foreground: #000000;'
);
content = content.replace(
  /--sidebar-primary: oklch\(0\.205 0 0\);/,
  '--sidebar-primary: #000000;'
);
content = content.replace(
  /--sidebar-primary-foreground: oklch\(0\.985 0 0\);/,
  '--sidebar-primary-foreground: #FFFFFF;'
);
content = content.replace(
  /--sidebar-accent: oklch\(0\.97 0 0\);/,
  '--sidebar-accent: #FFFFFF;'
);
content = content.replace(
  /--sidebar-accent-foreground: oklch\(0\.205 0 0\);/,
  '--sidebar-accent-foreground: #000000;'
);
content = content.replace(
  /--sidebar-border: oklch\(0\.922 0 0\);/,
  '--sidebar-border: #000000;'
);
content = content.replace(
  /--sidebar-ring: oklch\(0\.708 0 0\);/,
  '--sidebar-ring: #000000;'
);

fs.writeFileSync('app/globals.css', content);
