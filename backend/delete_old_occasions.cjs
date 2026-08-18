const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const occasions = await prisma.occasion.findMany();
  console.log('Occasions:', occasions.map(o => o.slug));

  const toDelete = occasions.filter(o => o.slug !== 'export');
  if (toDelete.length > 0) {
    await prisma.occasion.deleteMany({
      where: { id: { in: toDelete.map(o => o.id) } }
    });
    console.log('Deleted old occasions.');
  } else {
    console.log('No old occasions to delete.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
