const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRawUnsafe('DESCRIBE ProductVariant');
  console.log(result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
