import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  await prisma.user.update({
    where: { email: 'admin@srishtique.com' },
    data: { password: hashedPassword, isEmailVerified: true, role: 'SUPER_ADMIN' }
  });

  console.log('Password reset successfully for admin@srishtique.com');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
