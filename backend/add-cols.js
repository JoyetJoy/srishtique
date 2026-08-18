const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE Category ADD COLUMN sizeChart VARCHAR(191) NULL;');
    console.log('Added sizeChart to Category');
  } catch (e) {
    console.error('Category error:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe('ALTER TABLE Product ADD COLUMN sizeChart VARCHAR(191) NULL;');
    console.log('Added sizeChart to Product');
  } catch (e) {
    console.error('Product error:', e.message);
  }
}

run().then(() => {
  console.log('Done');
  process.exit(0);
});
