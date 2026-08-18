import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing AdminGeneralSetting...');
  await prisma.adminGeneralSetting.deleteMany();
  console.log('Cleared all existing settings.');

  console.log('Seeding AdminGeneralSetting...');
  await prisma.adminGeneralSetting.create({
    data: {
      id: 1,
      defaultCountryId: 31383,
      twoFactorApiKey: '7ae9509b-7274-11eb-a9bc-0200cd936042',
      loginOtpTemplate: 'partner',
      msg91AuthKey: '399204A7CmemKKd64be9f8eP1',
      msg91Template: '6494305bd6fc05217f4b0ab2'
    }
  });
  console.log('Successfully seeded AdminGeneralSetting with MSG91 credentials.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
