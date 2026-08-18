const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace dark purple with dark espresso (#110c08)
  content = content.replace(/#310D25/gi, '#110c08');
  content = content.replace(/#310d25/gi, '#110c08');
  
  // Replace lighter maroon with dark cream/brown (#1f150b)
  content = content.replace(/#4a1638/gi, '#1f150b');
  content = content.replace(/#4A1638/gi, '#1f150b');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.css') || fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Color replacement complete!');
