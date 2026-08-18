import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if Saree category exists
  let sareeCategory = await prisma.category.findUnique({
    where: { slug: 'saree' }
  });

  if (!sareeCategory) {
    sareeCategory = await prisma.category.create({
      data: {
        name: 'Saree',
        slug: 'saree',
        type: 'CLOTHING',
      }
    });
    console.log('Created Saree category:', sareeCategory.id);
  } else {
    console.log('Saree category already exists:', sareeCategory.id);
  }

  // Add the product
  const product = await prisma.product.create({
    data: {
      name: 'Royal Blue Silk Saree with Gold Zari',
      description: 'Exquisite royal blue silk saree featuring intricate gold zari motifs. Perfect for weddings and festive occasions.',
      images: ['/new_design/saree_1.png'],
      categoryId: sareeCategory.id,
      type: 'CLOTHING',
      isNewArrival: true,
      isTrending: true,
      isActive: true,
      variants: {
        create: [
          {
            size: 'Free Size',
            color: 'Royal Blue',
            price: 4500,
            originalPrice: 5500,
            stock: 10,
            sku: 'SAREE-RB-01'
          }
        ]
      }
    }
  });

  console.log('Created Saree product:', product.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
