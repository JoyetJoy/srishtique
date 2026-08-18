const fs = require('fs');
const path = require('path');

function updatePage(filename) {
  const filePath = path.join(__dirname, 'src/pages/auth', filename);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // State variables
  content = content.replace(/const \[email, setEmail\] = useState\(''\);/g, "const [phone, setPhone] = useState('');");

  // API calls body
  content = content.replace(/JSON\.stringify\(\{ email/g, "JSON.stringify({ phone");
  content = content.replace(/body: JSON\.stringify\(\{ phone, email/g, "body: JSON.stringify({ phone"); // rollback if accidentally caught

  // UI labels
  content = content.replace(/<label>Email Address<\/label>/g, "<label>Mobile Number</label>");
  content = content.replace(/placeholder="Enter your email"/g, "placeholder=\"Enter your mobile number\"");
  content = content.replace(/type="email"/g, "type=\"tel\"");
  content = content.replace(/value=\{email\}/g, "value={phone}");
  content = content.replace(/onChange=\{\(e\) => setEmail\(e\.target\.value\)\}/g, "onChange={(e) => setPhone(e.target.value)}");
  
  // Specific messages
  content = content.replace(/Enter your email to get started/g, "Enter your mobile number to get started");
  content = content.replace(/Verify email and set password/g, "Verify mobile number and set password");
  content = content.replace(/OTP Sent to Email/g, "OTP Sent to Mobile Number");
  content = content.replace(/Change Email/g, "Change Mobile Number");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated', filename);
}

updatePage('SignupPage.tsx');
updatePage('LoginPage.tsx');
updatePage('ForgotPasswordPage.tsx');
