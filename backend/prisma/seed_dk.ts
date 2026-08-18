import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DK Exporting seeding...');

  // Clean DB
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // 1. Create Site Settings for DK Exporting
  const initialHeroSlides = JSON.stringify([
    {
      id: 'slide-1',
      imageUrl: 'dk_exporting/banners/hero_banner.jpg',
      subtitle: 'GLOBAL TRADE. PREMIUM QUALITY. TRUSTED WORLDWIDE.',
      title: 'Premium Spices & Nuts',
      description: 'Direct from nature, delivered worldwide. Quality you can trust, partnership you can rely on.',
      button1Text: 'EXPLORE OUR CATALOG',
      button1Url: '/collections',
      button2Text: 'BULK ORDERS',
      button2Url: '/about',
    }
  ]);

  await prisma.siteSettings.upsert({
    where: { key: 'HERO_SLIDES' },
    update: { value: initialHeroSlides },
    create: { key: 'HERO_SLIDES', value: initialHeroSlides }
  });

  const initialOccasionSlides = JSON.stringify([]);
  await prisma.siteSettings.upsert({
    where: { key: 'OCCASION_SLIDES' },
    update: { value: initialOccasionSlides },
    create: { key: 'OCCASION_SLIDES', value: initialOccasionSlides }
  });

  // Seed Brand Logos - Using text logos or generic for now, we'll style text instead
  await prisma.siteSettings.upsert({
    where: { key: 'BRAND_LOGO_HEADER' },
    update: { value: '' }, // Leave empty, we'll use text in frontend
    create: { key: 'BRAND_LOGO_HEADER', value: '' }
  });

  await prisma.siteSettings.upsert({
    where: { key: 'BRAND_LOGO_FOOTER' },
    update: { value: '' },
    create: { key: 'BRAND_LOGO_FOOTER', value: '' }
  });

  // Categories
  const categorySpices = await prisma.category.create({
    data: {
      name: 'Spices',
      slug: 'spices',
      image: 'dk_exporting/products/black_pepper.jpg',
      type: 'SPICE'
    }
  });

  const categoryNuts = await prisma.category.create({
    data: {
      name: 'Nuts',
      slug: 'nuts',
      image: 'dk_exporting/products/cashew_nuts.jpg',
      type: 'NUT'
    }
  });

  // Occasions (required by schema but not used much in DK)
  const occasionDefault = await prisma.occasion.upsert({
    where: { slug: 'export' },
    update: { image: 'dk_exporting/banners/hero_banner.jpg', heroImage: 'dk_exporting/banners/hero_banner.jpg' },
    create: {
      name: 'Global Export',
      slug: 'export',
      image: 'dk_exporting/banners/hero_banner.jpg',
      heroImage: 'dk_exporting/banners/hero_banner.jpg'
    }
  });

  // Products
  const productsList = [
    {
      name: 'Black Pepper',
      description: 'Bold Aroma, Rich in Piperine, Handpicked Quality. All Varieties Available.',
      catId: categorySpices.id,
      img: 'dk_exporting/products/black_pepper.jpg',
      type: 'SPICE'
    },
    {
      name: 'Cashew Nuts',
      description: 'Whole Cashews (W240, W320, W450). Natural & Healthy, Creamy Taste, Premium Quality. All Varieties Available.',
      catId: categoryNuts.id,
      img: 'dk_exporting/products/cashew_nuts.jpg',
      type: 'NUT'
    },
    {
      name: 'Cardamom',
      description: 'Green Cardamom (Bold & Small). Strong Aroma, Export Quality. All Varieties Available.',
      catId: categorySpices.id,
      img: 'dk_exporting/products/green_cardamom.jpg',
      type: 'SPICE'
    },
    {
      name: 'Peri Peri Cashew Nuts',
      description: 'Spicy & Tangy Peri Peri coated premium cashews. Perfect for snacking.',
      catId: categoryNuts.id,
      img: 'dk_exporting/products/peri_peri_cashew.jpg',
      type: 'NUT'
    }
  ];

  for (const p of productsList) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        images: [p.img],
        categoryId: p.catId,
        type: p.type as any,
        isNewArrival: true,
        isActive: true,
        occasions: { connect: { id: occasionDefault.id } },
        variants: {
          create: [
            { size: '250 Grams', color: 'Standard', price: 250, originalPrice: 300, stock: 500 },
            { size: '500 Grams', color: 'Standard', price: 480, originalPrice: 600, stock: 500 },
            { size: '1 KG', color: 'Standard', price: 900, originalPrice: 1200, stock: 500 },
            { size: 'Bulk Orders', color: 'Standard', price: 8000, originalPrice: 10000, stock: 1000 }
          ]
        }
      }
    });
    console.log(`Created product: ${product.name}`);
  }

  console.log('DK Exporting Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
