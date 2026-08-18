const fs = require('fs');
const path = require('path');

const extensions = ['.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.json', '.md', '.env'];

const replacements = [
  { regex: /travancorevastralaya/g, replace: 'srishtique' },
  { regex: /Travancore Vasthralaya/g, replace: 'Srishtique' },
  { regex: /Travancore/g, replace: 'Srishtique' },
  { regex: /travancore/g, replace: 'srishtique' },
  { regex: /TRAVANCORE/g, replace: 'SRISHTIQUE' }
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist') && !file.includes('build')) {
        results = results.concat(walkDir(file));
      }
    } else {
      if (extensions.some(ext => file.endsWith(ext))) {
        results.push(file);
      }
    }
  });
  return results;
}

const frontendFiles = walkDir('d:\\\\srishtique\\\\frontend');
const backendFiles = walkDir('d:\\\\srishtique\\\\backend');

const allFiles = [...frontendFiles, ...backendFiles];

let changedFiles = 0;
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({ regex, replace }) => {
    content = content.replace(regex, replace);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Total files changed: ${changedFiles}`);
