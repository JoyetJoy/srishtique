const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/middleware/validate.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/email: z\.string\(\)\.email\('Invalid email format'\)/g, "phone: z.string().min(1, 'Mobile number is required'),\n    email: z.string().email('Invalid email format').optional()");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated validate.ts');
