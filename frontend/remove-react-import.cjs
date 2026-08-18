const fs = require('fs');
const path = require('path');

const files = [
  'FaqPage.tsx',
  'PrivacyPolicyPage.tsx',
  'ReturnPolicyPage.tsx',
  'ShippingPolicyPage.tsx',
  'TermsPage.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'src/pages', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import React from 'react';\n/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('Removed unused React imports');
