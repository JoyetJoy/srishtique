const fs = require('fs');

const filesToReplace = [
  {
    path: 'd:/srishtique-main/srishtique-main/backend/src/utils/email.ts',
    replacements: [
      { regex: /Srishtique/g, replacement: 'DK Exporting' },
      { regex: /srishtique/g, replacement: 'dkexporting' }
    ]
  },
  {
    path: 'd:/srishtique-main/srishtique-main/backend/migrate-order-numbers.ts',
    replacements: [
      { regex: /SRISHTIQUE-/g, replacement: 'DK-' }
    ]
  },
  {
    path: 'd:/srishtique-main/srishtique-main/frontend/src/context/CartContext.tsx',
    replacements: [
      { regex: /srishtique_cart/g, replacement: 'dk_cart' }
    ]
  },
  {
    path: 'd:/srishtique-main/srishtique-main/frontend/src/components/Navbar.tsx',
    replacements: [
      { regex: /srishtique_cart/g, replacement: 'dk_cart' }
    ]
  },
  {
    path: 'd:/srishtique-main/srishtique-main/frontend/src/pages/admin/AdminLayout.tsx',
    replacements: [
      { regex: /srishtique_cart/g, replacement: 'dk_cart' }
    ]
  },
  {
    path: 'd:/srishtique-main/srishtique-main/frontend/src/pages/FaqPage.tsx',
    replacements: [
      { regex: /support@dk_exporting.com/g, replacement: 'support@dkexporting.com' },
      { regex: /1800-SRISHTIQUE-CARE/g, replacement: '1800-DK-CARE' }
    ]
  }
];

filesToReplace.forEach(fileObj => {
  if (fs.existsSync(fileObj.path)) {
    let content = fs.readFileSync(fileObj.path, 'utf8');
    fileObj.replacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });
    fs.writeFileSync(fileObj.path, content, 'utf8');
    console.log(`Replaced in ${fileObj.path}`);
  } else {
    console.log(`File not found: ${fileObj.path}`);
  }
});
