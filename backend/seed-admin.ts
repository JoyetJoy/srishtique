import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@srishtique.com';
  const password = process.argv[3] || 'Admin@123';
  const phone = '0000000000'; // Default dummy phone

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
    create: {
      email,
      phone,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      isPhoneVerified: true
    }
  });

  console.log(`Successfully seeded admin: ${admin.email}`);
  console.log(`Password set successfully.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
