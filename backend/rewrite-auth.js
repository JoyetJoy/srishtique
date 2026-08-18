const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/controllers/auth.controller.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace imports
content = content.replace(/import \{ sendOTP \} from '\.\.\/utils\/email';/g, "import { sendSmsOTP } from '../utils/sms';");

// 1. requestOtp
content = content.replace(/const \{ email, name \} = req\.body;/g, "const { phone, email, name } = req.body;");
content = content.replace(/if \(!email\) \{\n\s*return res\.status\(400\)\.json\(\{ error: 'Email is required' \}\);\n\s*\}/g, "if (!phone) {\n      return res.status(400).json({ error: 'Mobile number is required' });\n    }");
content = content.replace(/where: \{ email \},/g, "where: { phone },");
content = content.replace(/create: \{ email, otp, otpExpiry, name, role: 'USER' \},/g, "create: { phone, email, otp, otpExpiry, name, role: 'USER' },");
content = content.replace(/await sendOTP\(email, otp\);/g, "await sendSmsOTP(phone, otp);");
content = content.replace(/Send email/g, "Send SMS");

// 2. verifySignup
content = content.replace(/const \{ email, otp, password \} = req\.body;/g, "const { phone, otp, password } = req.body;");
content = content.replace(/if \(!email \|\| !otp \|\| !password\) \{\n\s*return res\.status\(400\)\.json\(\{ error: 'Email, OTP, and password are required' \}\);\n\s*\}/g, "if (!phone || !otp || !password) {\n      return res.status(400).json({ error: 'Phone, OTP, and password are required' });\n    }");
content = content.replace(/isEmailVerified/g, "isPhoneVerified");
content = content.replace(/\{ userId: updatedUser\.id, email: updatedUser\.email, role: updatedUser\.role \},/g, "{ userId: updatedUser.id, phone: updatedUser.phone, role: updatedUser.role },");
content = content.replace(/email: updatedUser\.email,/g, "phone: updatedUser.phone,\n        email: updatedUser.email,");

// 3. login
content = content.replace(/const \{ email, password \} = req\.body;/g, "const { phone, password } = req.body;");
content = content.replace(/if \(!email \|\| !password\) \{\n\s*return res\.status\(400\)\.json\(\{ error: 'Email and password are required' \}\);\n\s*\}/g, "if (!phone || !password) {\n      return res.status(400).json({ error: 'Mobile number and password are required' });\n    }");
content = content.replace(/error: 'Invalid email or password'/g, "error: 'Invalid mobile number or password'");
content = content.replace(/error: 'Please verify your email first'/g, "error: 'Please verify your mobile number first'");
content = content.replace(/\{ userId: user\.id, email: user\.email, role: user\.role \},/g, "{ userId: user.id, phone: user.phone, role: user.role },");
content = content.replace(/email: user\.email,/g, "phone: user.phone,\n        email: user.email,");

// 4. checkGuestEmail -> checkGuestPhone
content = content.replace(/export const checkGuestEmail = /g, "export const checkGuestPhone = ");
content = content.replace(/const \{ email \} = req\.body;\n\s*if \(!email\) return res\.status\(400\)\.json\(\{ error: 'Email is required' \}\);/g, "const { phone } = req.body;\n    if (!phone) return res.status(400).json({ error: 'Mobile number is required' });");
content = content.replace(/Failed to check email/g, "Failed to check mobile number");

// 5. forgotPasswordRequestOtp
content = content.replace(/const \{ email \} = req\.body;\n\s*if \(!email\) return res\.status\(400\)\.json\(\{ error: 'Email is required' \}\);/g, "const { phone } = req.body;\n    if (!phone) return res.status(400).json({ error: 'Mobile number is required' });");
content = content.replace(/User with this email does not exist/g, "User with this mobile number does not exist");
content = content.replace(/OTP sent successfully to your email/g, "OTP sent successfully to your mobile number");

// 6. resetPasswordVerify
content = content.replace(/const \{ email, otp, password \} = req\.body;\n\s*if \(!email \|\| !otp \|\| !password\) \{\n\s*return res\.status\(400\)\.json\(\{ error: 'Email, OTP, and new password are required' \}\);\n\s*\}/g, "const { phone, otp, password } = req.body;\n    if (!phone || !otp || !password) {\n      return res.status(400).json({ error: 'Mobile number, OTP, and new password are required' });\n    }");

// 7. guestLogin
content = content.replace(/const \{ email, address \} = req\.body;/g, "const { phone, email, address } = req.body;");
content = content.replace(/if \(!email\) \{\n\s*return res\.status\(400\)\.json\(\{ error: 'Email is required' \}\);\n\s*\}/g, "if (!phone) {\n      return res.status(400).json({ error: 'Mobile number is required' });\n    }");
content = content.replace(/create: \{ \n\s*email, /g, "create: { \n        phone, \n        email, ");

// 8. verifyGuestLogin
content = content.replace(/const \{ email, otp \} = req\.body;\n\s*if \(!email \|\| !otp\) \{\n\s*return res\.status\(400\)\.json\(\{ error: 'Email and OTP are required' \}\);\n\s*\}/g, "const { phone, otp } = req.body;\n    if (!phone || !otp) {\n      return res.status(400).json({ error: 'Mobile number and OTP are required' });\n    }");

// 9. checkoutRegister
content = content.replace(/const \{ email, password, addressObj, name \} = req\.body;/g, "const { phone, email, password, addressObj, name } = req.body;");
content = content.replace(/if \(!email \|\| !addressObj\) \{\n\s*return res\.status\(400\)\.json\(\{ error: 'Email and address are required' \}\);\n\s*\}/g, "if (!phone || !addressObj) {\n      return res.status(400).json({ error: 'Mobile number and address are required' });\n    }");
content = content.replace(/Email not verified/g, "Mobile number not verified");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated auth.controller.ts');
