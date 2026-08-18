const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('Srishtique')) {
      let newContent = content.replace(/Srishtique/g, 'DK Exporting');
      newContent = newContent.replace(/srishtique/g, 'dk_exporting'); // For URLs or lowercases
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated', filePath);
    }
  }
});

let htmlPath = './index.html';
if (fs.existsSync(htmlPath)) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  let newContent = content.replace(/Srishtique/g, 'DK Exporting');
  fs.writeFileSync(htmlPath, newContent, 'utf8');
}
