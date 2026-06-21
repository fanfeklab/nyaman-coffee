const fs = require('fs');

const files = fs.readdirSync('store').filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const path = 'store/' + f;
  let content = fs.readFileSync(path, 'utf8');
  
  // Remove all incorrect injects
  content = content.replace(/,\n\s*storage: createJSONStorage\(\(\) => idbStorage\)/g, '');
  content = content.replace(/\n\s*storage: createJSONStorage\(\(\) => idbStorage\),?/g, '');
  
  // Now explicitly add to the persist options
  // The persist options usually look like:
  // {
  //   name: 'pos-some-storage'
  // }
  
  content = content.replace(/(name:\s*['"]pos-.*?['"])/g, "$1,\n  storage: createJSONStorage(() => idbStorage)");
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('Fixed ' + f);
});
