import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function deleteCategories() {
  const categoriesToDelete = ['Necklaces', 'Earrings', 'Bangles', 'Rings', 'Anklets'];
  
  for (const name of categoriesToDelete) {
    const category = await prisma.category.findFirst({ where: { name } });
    if (category) {
      // Delete products first to avoid foreign key constraints
      await prisma.product.deleteMany({ where: { categoryId: category.id } });
      await prisma.category.delete({ where: { id: category.id } });
      console.log(`Deleted category ${name} and its products.`);
    }
  }
}

deleteCategories().catch(console.error).finally(() => prisma.$disconnect());
