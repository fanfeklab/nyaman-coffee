const fs = require('fs');

const files = fs.readdirSync('store').filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const path = 'store/' + f;
  let content = fs.readFileSync(path, 'utf8');
  
  if (content.includes('persist(')) {
    // Add createJSONStorage import if not there
    if (!content.includes('createJSONStorage')) {
      content = content.replace("import { persist } from 'zustand/middleware';", "import { persist, createJSONStorage } from 'zustand/middleware';");
    }
    
    // Add idbStorage import
    if (!content.includes('idbStorage')) {
      content = "import { idbStorage } from '@/lib/idbStorage';\n" + content;
    }
    
    // Add storage option
    if (!content.includes('storage: createJSONStorage')) {
      content = content.replace(/name:\s*['"](.*?)['"]/g, "name: '$1',\n  storage: createJSONStorage(() => idbStorage)");
    }
    
    fs.writeFileSync(path, content, 'utf8');
    console.log('Updated ' + f);
  }
});
