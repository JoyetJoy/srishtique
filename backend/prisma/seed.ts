import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});

  // 1. Create Site Settings
  const initialHeroSlides = JSON.stringify([
    {
      id: 'slide-1',
      imageUrl: 'srishtique/banners/hero_banner.png',
      subtitle: 'ROOTED IN TRADITION',
      title: 'Crafting Timeless Elegance for Every Occasion',
      description: 'From luxurious ethnic wear to exquisite jewellery, every piece is carefully curated to celebrate tradition, craftsmanship, and the beauty of every moment.',
      button1Text: 'EXPLORE COLLECTIONS',
      button1Url: '/collections',
      button2Text: 'OUR STORY',
      button2Url: '/about',
    }
  ]);

  await prisma.siteSettings.upsert({
    where: { key: 'HERO_SLIDES' },
    update: { value: initialHeroSlides },
    create: { key: 'HERO_SLIDES', value: initialHeroSlides }
  });

  const initialOccasionSlides = JSON.stringify([
    {
      id: 'occ-slide-1',
      imageUrl: 'srishtique/banners/maternity_banner.png',
      title: 'Where Every Occasion\nFinds Its Perfect Look',
      description: 'We believe every celebration deserves something extraordinary. At Srishtique, you\'ll discover thoughtfully curated ethnic wear and jewellery designed to complement every occasion with sophistication, comfort, and timeless charm.',
      linkText: 'KNOW OUR STORY',
      linkUrl: '/about'
    }
  ]);

  await prisma.siteSettings.upsert({
    where: { key: 'OCCASION_SLIDES' },
    update: { value: initialOccasionSlides },
    create: { key: 'OCCASION_SLIDES', value: initialOccasionSlides }
  });

  // Seed Brand Logos
  await prisma.siteSettings.upsert({
    where: { key: 'BRAND_LOGO_HEADER' },
    update: { value: 'srishtique/branding/logo_header.png' },
    create: { key: 'BRAND_LOGO_HEADER', value: 'srishtique/branding/logo_header.png' }
  });

  await prisma.siteSettings.upsert({
    where: { key: 'BRAND_LOGO_FOOTER' },
    update: { value: 'srishtique/branding/logo.png' },
    create: { key: 'BRAND_LOGO_FOOTER', value: 'srishtique/branding/logo.png' }
  });

  await prisma.siteSettings.upsert({
    where: { key: 'BRAND_LOGO_PDF' },
    update: { value: 'srishtique/branding/srishtique-pdf-logo.png' },
    create: { key: 'BRAND_LOGO_PDF', value: 'srishtique/branding/srishtique-pdf-logo.png' }
  });

  // Ornament Categories
  const categoryNecklaces = await prisma.category.upsert({
    where: { slug: 'necklaces' },
    update: { image: 'srishtique/categories/category_necklaces.png', type: 'ORNAMENT' },
    create: {
      name: 'Necklaces',
      slug: 'necklaces',
      image: 'srishtique/categories/category_necklaces.png',
      type: 'ORNAMENT'
    }
  });

  const categoryEarrings = await prisma.category.upsert({
    where: { slug: 'earrings' },
    update: { image: 'srishtique/categories/category_earrings.png', type: 'ORNAMENT' },
    create: {
      name: 'Earrings',
      slug: 'earrings',
      image: 'srishtique/categories/category_earrings.png',
      type: 'ORNAMENT'
    }
  });

  const categoryBangles = await prisma.category.upsert({
    where: { slug: 'bangles' },
    update: { image: 'srishtique/categories/category_bangles.png', type: 'ORNAMENT' },
    create: {
      name: 'Bangles',
      slug: 'bangles',
      image: 'srishtique/categories/category_bangles.png',
      type: 'ORNAMENT'
    }
  });

  const categoryRings = await prisma.category.upsert({
    where: { slug: 'rings' },
    update: { image: 'srishtique/categories/category_rings.png', type: 'ORNAMENT' },
    create: {
      name: 'Rings',
      slug: 'rings',
      image: 'srishtique/categories/category_rings.png',
      type: 'ORNAMENT'
    }
  });

  const categoryAnklets = await prisma.category.upsert({
    where: { slug: 'anklets' },
    update: { image: 'srishtique/categories/category_anklets.png', type: 'ORNAMENT' },
    create: {
      name: 'Anklets',
      slug: 'anklets',
      image: 'srishtique/categories/category_anklets.png',
      type: 'ORNAMENT'
    }
  });

  const categoryPendants = await prisma.category.upsert({
    where: { slug: 'pendants' },
    update: { image: 'srishtique/categories/category_pendants.png', type: 'ORNAMENT' },
    create: {
      name: 'Pendants',
      slug: 'pendants',
      image: 'srishtique/categories/category_pendants.png',
      type: 'ORNAMENT'
    }
  });

  const categoryChains = await prisma.category.upsert({
    where: { slug: 'chains' },
    update: { image: 'srishtique/categories/category_chains.png', type: 'ORNAMENT' },
    create: {
      name: 'Chains',
      slug: 'chains',
      image: 'srishtique/categories/category_chains.png',
      type: 'ORNAMENT'
    }
  });

  const categoryBracelets = await prisma.category.upsert({
    where: { slug: 'bracelets' },
    update: { image: 'srishtique/categories/category_bracelets.png', type: 'ORNAMENT' },
    create: {
      name: 'Bracelets',
      slug: 'bracelets',
      image: 'srishtique/categories/category_bracelets.png',
      type: 'ORNAMENT'
    }
  });

  const categoryMangalsutras = await prisma.category.upsert({
    where: { slug: 'mangalsutras' },
    update: { image: 'srishtique/categories/category_mangalsutras.png', type: 'ORNAMENT' },
    create: {
      name: 'Mangalsutras',
      slug: 'mangalsutras',
      image: 'srishtique/categories/category_mangalsutras.png',
      type: 'ORNAMENT'
    }
  });

  const categoryNoseRings = await prisma.category.upsert({
    where: { slug: 'nose-rings' },
    update: { image: 'srishtique/categories/category_nose_rings.png', type: 'ORNAMENT' },
    create: {
      name: 'Nose Rings',
      slug: 'nose-rings',
      image: 'srishtique/categories/category_nose_rings.png',
      type: 'ORNAMENT'
    }
  });

  // 2. Create Occasions
  const occasionFestival = await prisma.occasion.upsert({
    where: { slug: 'festival' },
    update: { image: 'srishtique/occasions/occasion_festival.png', heroImage: 'srishtique/banners/hero_banner.png' },
    create: {
      name: 'Festival',
      slug: 'festival',
      image: 'srishtique/occasions/occasion_festival.png',
      heroImage: 'srishtique/banners/hero_banner.png'
    }
  });

  const occasionOffice = await prisma.occasion.upsert({
    where: { slug: 'office' },
    update: { image: 'srishtique/occasions/occasion_festival.png', heroImage: null },
    create: {
      name: 'Office',
      slug: 'office',
      image: 'srishtique/occasions/occasion_festival.png',
      heroImage: null
    }
  });

  const occasionMaternity = await prisma.occasion.upsert({
    where: { slug: 'maternity' },
    update: { image: 'srishtique/occasions/occasion_festival.png', heroImage: 'srishtique/banners/maternity_banner.png' },
    create: {
      name: 'Maternity',
      slug: 'maternity',
      image: 'srishtique/occasions/occasion_festival.png',
      heroImage: 'srishtique/banners/maternity_banner.png'
    }
  });

  // 3. Create Products

  // Ornament Products
  const categoriesList = [
    { cat: categoryNecklaces, name: 'Necklace', img: 'srishtique/products/prod_necklace.png' },
    { cat: categoryEarrings, name: 'Earring', img: 'srishtique/products/prod_earring.png' },
    { cat: categoryBangles, name: 'Bangle', img: 'srishtique/products/prod_bangle.png' },
    { cat: categoryRings, name: 'Ring', img: 'srishtique/products/prod_ring.png' },
    { cat: categoryAnklets, name: 'Anklet', img: 'srishtique/products/prod_anklet.png' },
    { cat: categoryPendants, name: 'Pendant', img: 'srishtique/products/prod_pendant.png' },
    { cat: categoryChains, name: 'Chain', img: 'srishtique/products/prod_chain.png' },
    { cat: categoryBracelets, name: 'Bracelet', img: 'srishtique/categories/category_bracelets.png' },
    { cat: categoryMangalsutras, name: 'Mangalsutra', img: 'srishtique/categories/category_mangalsutras.png' },
    { cat: categoryNoseRings, name: 'Nose Ring', img: 'srishtique/categories/category_nose_rings.png' }
  ];

  for (const c of categoriesList) {
    for (let i = 1; i <= 3; i++) {
      const p = await prisma.product.create({
        data: {
          name: `Luxury Gold ${c.name} - Style ${i}`,
          description: `Elegant and premium ${c.name.toLowerCase()} with intricate detailing. Perfect for all occasions.`,
          images: [c.img],
          categoryId: c.cat.id,
          type: 'ORNAMENT',
          isNewArrival: i === 1,
          isTrending: i === 2,
          occasions: { connect: { id: occasionFestival.id } },
          variants: {
            create: [{ size: 'Free Size', color: 'Gold', price: 1000 + (i * 200), originalPrice: 1500 + (i * 200), stock: 20 }]
          }
        }
      });
      console.log(`Created product: ${p.name}`);
    }
  }

  // 4. Create Countries, States, and Cities
  console.log('Seeding countries, states, and cities...');

  // Clear existing to avoid duplicate key errors on repeated seeds
  await prisma.state.deleteMany({});
  await prisma.country.deleteMany({});

  await prisma.country.create({
    data: {
      name: 'India',
      states: {
        create: [
          { name: 'Maharashtra' },
          { name: 'Karnataka' },
          { name: 'Delhi' }
        ]
      }
    }
  });

  await prisma.country.create({
    data: {
      name: 'United States',
      states: {
        create: [
          { name: 'New York' },
          { name: 'California' },
          { name: 'Texas' }
        ]
      }
    }
  });

  console.log('Seeded countries and states.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
