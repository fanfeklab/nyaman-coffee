const fs = require('fs');
const glob = require('glob');

const files = glob.sync('{app,components}/**/*.tsx');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  // Handle single line and multi line where label is an attribute of SelectItem
  let newContent = content.replace(/(<SelectItem\b[^>]*?)\s+label=(?:'[^']*'|"[^"]*"|\{.*?\})/g, '$1');
  
  if (content !== newContent) {
    fs.writeFileSync(f, newContent, 'utf8');
    console.log('Fixed label in ' + f);
  }
});
