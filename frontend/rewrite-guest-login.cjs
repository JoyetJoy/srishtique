const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/auth/GuestLoginPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// State variables
content = content.replace(/const \[email, setEmail\] = useState\(''\);/g, "const [phone, setPhone] = useState('');\n  const [email, setEmail] = useState('');");
content = content.replace(/const \[isEmailVerified, setIsEmailVerified\] = useState\(false\);/g, "const [isPhoneVerified, setIsPhoneVerified] = useState(false);");

// Handlers
content = content.replace(/handleVerifyEmailClick/g, "handleVerifyPhoneClick");
content = content.replace(/if \(!email\)/g, "if (!phone)");
content = content.replace(/setError\('Please enter your email first\.'\);/g, "setError('Please enter your mobile number first.');");
content = content.replace(/body: JSON\.stringify\(\{ email: email\.trim\(\) \}\)/g, "body: JSON.stringify({ phone: phone.trim() })");
content = content.replace(/'\/api\/auth\/guest-check-email'/g, "'/api/auth/guest-check-phone'");
content = content.replace(/toast\.success\('OTP sent to your email!'\);/g, "toast.success('OTP sent to your mobile number!');");

content = content.replace(/body: JSON\.stringify\(\{ email: email\.trim\(\), otp: otp\.trim\(\) \}\)/g, "body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() })");
content = content.replace(/setIsEmailVerified\(true\);/g, "setIsPhoneVerified(true);");
content = content.replace(/toast\.success\('Email verified!'\);/g, "toast.success('Mobile number verified!');");

content = content.replace(/if \(!isEmailVerified\)/g, "if (!isPhoneVerified)");
content = content.replace(/setError\('Please verify your email first\.'\);/g, "setError('Please verify your mobile number first.');");

content = content.replace(/email: email\.trim\(\),/g, "phone: phone.trim(),\n          email: email.trim(),");
content = content.replace(/isEmailVerified \? '#f8fafc' : 'white'/g, "isPhoneVerified ? '#f8fafc' : 'white'");
content = content.replace(/disabled=\{isEmailVerified\}/g, "disabled={isPhoneVerified}");
content = content.replace(/!isEmailVerified/g, "!isPhoneVerified");
content = content.replace(/isEmailVerified/g, "isPhoneVerified");
content = content.replace(/!email/g, "!phone");

// UI texts
content = content.replace(/<label>Email Address<\/label>/g, "<label>Mobile Number <span style={{color: 'red'}}>*</span></label>");
content = content.replace(/placeholder="Enter your email"/g, "placeholder=\"Enter your mobile number\"");
content = content.replace(/type="email"/g, "type=\"tel\"");
content = content.replace(/value=\{email\}/g, "value={phone}");
content = content.replace(/onChange=\{\(e\) => setEmail\(e\.target\.value\)\}/g, "onChange={(e) => setPhone(e.target.value)}");
content = content.replace(/Verify Email/g, "Verify Mobile");
content = content.replace(/We sent a 6-digit code to \{email\}\./g, "We sent a 6-digit code to {phone}.");

// Let's add email field back if it was replaced entirely in the customer details form.
// Actually, I'll manually review the file after this script and add the email field back nicely.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated GuestLoginPage.tsx');
