import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@dkexport.com';
  const plainPassword = 'Admin@123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email: email,
        password: hashedPassword,
      }
    });
    console.log(`Admin credentials updated successfully to ${email} / ${plainPassword}`);
  } else {
    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
        phone: '9999999999', // dummy phone required by schema
        name: 'Admin',
        role: 'SUPER_ADMIN',
        isPhoneVerified: true
      }
    });
    console.log(`Admin user created with ${email} / ${plainPassword}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
