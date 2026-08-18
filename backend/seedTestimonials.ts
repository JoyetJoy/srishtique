import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Seeding Testimonials...');

  await prisma.testimonial.deleteMany({});

  const reviews = [
    {
      name: 'Anjali M',
      rating: 4,
      text: 'Absolutely love the quality! The fabric is so soft and comfortable. The cord set is my go-to for casual outings.',
      productImg: 'srishtique/products/product_1.png',
    },
    {
      name: 'Anjali M',
      rating: 5,
      text: 'Beautiful maternity wear! Comfortable throughout my pregnancy. The frock is stunning and fits perfectly.',
      productImg: 'srishtique/products/product_5.png',
    },
    {
      name: 'Anjali M',
      rating: 4,
      text: 'Great collection of kurtis! The rayon kurta is perfect for office wear. Very happy with the purchase.',
      productImg: 'srishtique/products/product_2.png',
    },
    {
      name: 'Anjali M',
      rating: 5,
      text: 'Excellent stitching and the colors are exactly as shown. Delivery was quick and packaging was premium!',
      productImg: 'srishtique/products/product_3.png',
    },
    {
      name: 'Anjali M',
      rating: 5,
      text: 'Love this cord set! Perfect for everyday wear. The material is breathable and comfortable.',
      productImg: 'srishtique/products/product_4.png',
    },
  ];

  for (const review of reviews) {
    await prisma.testimonial.create({ data: review });
  }

  console.log('✅ Seeded 5 testimonials');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
