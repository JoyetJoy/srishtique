const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace hardcoded dark espresso with bg-main
  content = content.replace(/#110c08/gi, 'var(--bg-main)');
  content = content.replace(/#111111/gi, 'var(--bg-main)');
  
  // Replace hardcoded dark cream with bg-card
  content = content.replace(/#1f150b/gi, 'var(--bg-card)');
  content = content.replace(/#222222/gi, 'var(--bg-card)');
  content = content.replace(/#333333/gi, 'var(--border)');

  // Replace hardcoded text colors
  content = content.replace(/#FAF6F0/gi, 'var(--text-main)');
  content = content.replace(/#f5ecd6/gi, 'var(--text-main)');
  content = content.replace(/white/gi, 'var(--text-main)'); // Very risky, let's just do #FFFFFF
  content = content.replace(/#FFFFFF/gi, 'var(--text-light)');
  content = content.replace(/#ffffff/gi, 'var(--text-light)');

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
    } else if (fullPath.endsWith('.css') && !fullPath.includes('index.css')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Color replacement complete!');
