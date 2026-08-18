const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log('Total products in DB:', count);
  
  const products = await prisma.product.findMany({
    select: { id: true, name: true, type: true }
  });
  console.log(products);

  // If there are many products, let's delete the ones that are not SPICE or NUT
  const toDelete = products.filter(p => p.type !== 'SPICE' && p.type !== 'NUT');
  console.log('Ornaments to delete:', toDelete.length);
  
  if (toDelete.length > 0) {
    await prisma.productVariant.deleteMany({
      where: { productId: { in: toDelete.map(p => p.id) } }
    });
    await prisma.product.deleteMany({
      where: { id: { in: toDelete.map(p => p.id) } }
    });
    console.log('Deleted old products.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
