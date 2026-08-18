import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.update({
    where: { email: 'admin@srishtique' },
    data: { isPhoneVerified: true }
  });
  console.log('Updated admin isPhoneVerified:', admin.isPhoneVerified);
}

main().finally(() => prisma.$disconnect());
