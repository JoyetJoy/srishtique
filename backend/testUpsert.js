const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'prasanththebest22@gmail.com';
  const otp = '123456';
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
  await prisma.user.upsert({
    where: { email },
    update: { 
      otp, 
      otpExpiry, 
    },
    create: { 
      email, 
      otp, 
      otpExpiry, 
      address: '', 
      role: 'USER', 
      isEmailVerified: false 
    }
  });

  const user = await prisma.user.findUnique({
    where: { email },
  });
  console.log('After upsert:', { otp: user.otp, otpExpiry: user.otpExpiry });
}

main().catch(console.error).finally(() => prisma.$disconnect());
