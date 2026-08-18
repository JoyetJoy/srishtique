import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.cartAbandonment.deleteMany({});
  await prisma.scheduledMessage.deleteMany({});
  await prisma.festivalMessage.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.testimonial.deleteMany({});
  await prisma.staticPageSeo.deleteMany({});
  await prisma.siteSettings.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.occasion.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.state.deleteMany({});
  await prisma.country.deleteMany({});
  await prisma.adminGeneralSetting.deleteMany({});

  // ─────────────────────────────────────────────
  // 1. ADMIN USER (SUPER_ADMIN)
  // ─────────────────────────────────────────────
  console.log('\n👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Srishtique Admin',
      email: 'admin@srishtique.com',
      phone: '9999999999',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isPhoneVerified: true,
      telegramChatId: '123456789', // Fake admin Telegram chat ID
      telegramUsername: 'atma_admin',
      telegramLinkedAt: new Date(),
    },
  });
  console.log(`  ✅ Admin: phone=${admin.phone}, password=Admin@123`);

  // ─────────────────────────────────────────────
  // 2. TEST USERS (some with Telegram, some without)
  // ─────────────────────────────────────────────
  console.log('\n👥 Creating test users...');
  const userPassword = await bcrypt.hash('User@123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@test.com',
      phone: '9876543210',
      password: userPassword,
      role: 'USER',
      isPhoneVerified: true,
      telegramChatId: '111111111', // Linked to Telegram
      telegramUsername: 'priya_shops',
      telegramLinkedAt: new Date(),
    },
  });
  console.log(`  ✅ User1 (TG linked): phone=${user1.phone}`);

  const user2 = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'rahul@test.com',
      phone: '9876543211',
      password: userPassword,
      role: 'USER',
      isPhoneVerified: true,
      telegramChatId: '222222222', // Linked to Telegram
      telegramUsername: 'rahul_v',
      telegramLinkedAt: new Date(),
    },
  });
  console.log(`  ✅ User2 (TG linked): phone=${user2.phone}`);

  const user3 = await prisma.user.create({
    data: {
      name: 'Anita Patel',
      email: 'anita@test.com',
      phone: '9876543212',
      password: userPassword,
      role: 'USER',
      isPhoneVerified: true,
      // No telegram linked
    },
  });
  console.log(`  ✅ User3 (no TG): phone=${user3.phone}`);

  const user4 = await prisma.user.create({
    data: {
      name: 'Vikram Singh',
      email: 'vikram@test.com',
      phone: '9876543213',
      password: userPassword,
      role: 'USER',
      isPhoneVerified: true,
      telegramChatId: '444444444', // Linked to Telegram
      telegramUsername: 'vikram_s',
      telegramLinkedAt: new Date(),
    },
  });
  console.log(`  ✅ User4 (TG linked): phone=${user4.phone}`);

  const user5 = await prisma.user.create({
    data: {
      name: 'Guest User',
      phone: '9876543214',
      role: 'USER',
      isPhoneVerified: true,
      // No password, no telegram — guest user
    },
  });
  console.log(`  ✅ User5 (guest, no TG): phone=${user5.phone}`);

  // ─────────────────────────────────────────────
  // 3. ADDRESSES
  // ─────────────────────────────────────────────
  console.log('\n📍 Creating addresses...');
  await prisma.address.createMany({
    data: [
      { userId: user1.id, street: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001', isDefault: true },
      { userId: user1.id, street: '45 Park Street', city: 'Pune', state: 'Maharashtra', country: 'India', pincode: '411001', isDefault: false },
      { userId: user2.id, street: '78 Civil Lines', city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001', isDefault: true },
      { userId: user3.id, street: '23 Anna Salai', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400002', isDefault: true },
      { userId: user4.id, street: '56 Nehru Nagar', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560001', isDefault: true },
    ],
  });
  console.log('  ✅ 5 addresses created');

  // ─────────────────────────────────────────────
  // 4. CATEGORIES
  // ─────────────────────────────────────────────
  console.log('\n📂 Creating categories...');
  const catKurtas = await prisma.category.create({ data: { name: 'Kurtas', slug: 'kurtas', type: 'CLOTHING', image: 'srishtique/categories/cat_kurtas.png' } });
  const catSets = await prisma.category.create({ data: { name: 'Sets', slug: 'sets', type: 'CLOTHING', image: 'srishtique/categories/cat_sets.png' } });
  const catDresses = await prisma.category.create({ data: { name: 'Dresses', slug: 'dresses', type: 'CLOTHING', image: 'srishtique/categories/cat_dresses.png' } });
  const catNecklaces = await prisma.category.create({ data: { name: 'Necklaces', slug: 'necklaces', type: 'ORNAMENT', image: 'srishtique/categories/cat_necklaces.png' } });
  const catEarrings = await prisma.category.create({ data: { name: 'Earrings', slug: 'earrings', type: 'ORNAMENT', image: 'srishtique/categories/cat_earrings.png' } });
  console.log('  ✅ 5 categories created');

  // ─────────────────────────────────────────────
  // 5. OCCASIONS
  // ─────────────────────────────────────────────
  console.log('\n🎉 Creating occasions...');
  const occFestival = await prisma.occasion.create({ data: { name: 'Festival', slug: 'festival', image: 'srishtique/occasions/occ_festival.png' } });
  const occOffice = await prisma.occasion.create({ data: { name: 'Office', slug: 'office', image: 'srishtique/occasions/occ_office.png' } });
  const occMaternity = await prisma.occasion.create({ data: { name: 'Maternity', slug: 'maternity', image: 'srishtique/occasions/occ_maternity.png' } });
  console.log('  ✅ 3 occasions created');

  // ─────────────────────────────────────────────
  // 6. PRODUCTS + VARIANTS
  // ─────────────────────────────────────────────
  console.log('\n👗 Creating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Green Embroidered Kurta',
        description: 'Beautiful green embroidered kurta perfect for festivals.',
        images: ['srishtique/products/kurta_green.png'],
        categoryId: catKurtas.id,
        isNewArrival: true,
        isTrending: true,
        variants: {
          create: [
            { size: 'S', color: 'Green', price: 999, originalPrice: 1299, stock: 10 },
            { size: 'M', color: 'Green', price: 999, originalPrice: 1299, stock: 15 },
            { size: 'L', color: 'Green', price: 999, originalPrice: 1299, stock: 8 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Red Silk Kurti',
        description: 'Elegant red silk kurti for special occasions.',
        images: ['srishtique/products/kurti_red.png'],
        categoryId: catKurtas.id,
        isTrending: true,
        variants: {
          create: [
            { size: 'M', color: 'Red', price: 1499, originalPrice: 1999, stock: 5 },
            { size: 'L', color: 'Red', price: 1499, originalPrice: 1999, stock: 7 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Blue Cotton Set',
        description: 'Comfortable blue cotton set for everyday office wear.',
        images: ['srishtique/products/set_blue.png'],
        categoryId: catSets.id,
        isTrending: true,
        variants: {
          create: [
            { size: 'S', color: 'Blue', price: 1299, originalPrice: 1599, stock: 12 },
            { size: 'M', color: 'Blue', price: 1299, originalPrice: 1599, stock: 10 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Yellow Party Dress',
        description: 'Vibrant yellow dress for parties and casual outings.',
        images: ['srishtique/products/dress_yellow.png'],
        categoryId: catDresses.id,
        isNewArrival: true,
        variants: {
          create: [
            { size: 'M', color: 'Yellow', price: 1899, originalPrice: 2499, stock: 6 },
            { size: 'L', color: 'Yellow', price: 1899, originalPrice: 2499, stock: 4 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gold Pendant Necklace',
        description: 'Elegant gold-plated pendant necklace.',
        images: ['srishtique/products/necklace_gold.png'],
        categoryId: catNecklaces.id,
        type: 'ORNAMENT',
        isNewArrival: true,
        variants: {
          create: [{ size: 'Free Size', color: 'Gold', price: 1000, originalPrice: 1499, stock: 20 }],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Crystal Drop Earrings',
        description: 'Stunning crystal drop earrings.',
        images: ['srishtique/products/earring_crystal.png'],
        categoryId: catEarrings.id,
        type: 'ORNAMENT',
        variants: {
          create: [{ size: 'Free Size', color: 'Silver', price: 800, originalPrice: 1200, stock: 25 }],
        },
      },
    }),
  ]);
  console.log(`  ✅ ${products.length} products created`);

  // Fetch all variants to reference by product name + size + color
  const allVariants = await prisma.productVariant.findMany({
    include: { product: { select: { name: true } } },
  });
  const v = (productName: string, size: string, color: string) =>
    allVariants.find((x) => x.product.name === productName && x.size === size && x.color === color)!;
  console.log(`  ✅ ${allVariants.length} variants fetched`);

  // Link occasions to products
  await prisma.occasion.update({ where: { id: occFestival.id }, data: { products: { connect: [{ id: products[0].id }, { id: products[1].id }, { id: products[4].id }] } } });
  await prisma.occasion.update({ where: { id: occOffice.id }, data: { products: { connect: [{ id: products[2].id }] } } });
  await prisma.occasion.update({ where: { id: occMaternity.id }, data: { products: { connect: [{ id: products[3].id }] } } });

  // ─────────────────────────────────────────────
  // 7. ORDERS (for testing order alerts + status updates)
  // ─────────────────────────────────────────────
  console.log('\n📦 Creating test orders...');

  // Order 1: PENDING — user1 (TG linked) — should trigger admin alert
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'PENDING',
      totalAmount: 2498,
      shippingAddress: { street: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001' },
      razorpayOrderId: 'order_test_001',
      razorpayPaymentId: 'pay_test_001',
      items: {
        create: [
          { productVariantId: v('Green Embroidered Kurta', 'M', 'Green').id, quantity: 1, priceAtPurchase: 999 },
          { productVariantId: v('Red Silk Kurti', 'M', 'Red').id, quantity: 1, priceAtPurchase: 1499 },
        ],
      },
    },
  });
  console.log(`  ✅ Order #${order1.id} — PENDING — ₹2498 (user: ${user1.name})`);

  // Order 2: PROCESSING — user2 (TG linked) — for status update test
  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      status: 'PROCESSING',
      totalAmount: 1299,
      shippingAddress: { street: '78 Civil Lines', city: 'Delhi', state: 'Delhi', country: 'India', pincode: '110001' },
      razorpayOrderId: 'order_test_002',
      razorpayPaymentId: 'pay_test_002',
      items: {
        create: [
          { productVariantId: v('Blue Cotton Set', 'S', 'Blue').id, quantity: 1, priceAtPurchase: 1299 },
        ],
      },
    },
  });
  console.log(`  ✅ Order #${order2.id} — PROCESSING — ₹1299 (user: ${user2.name})`);

  // Order 3: SHIPPED — user4 (TG linked) — with tracking number
  const order3 = await prisma.order.create({
    data: {
      userId: user4.id,
      status: 'SHIPPED',
      totalAmount: 1000,
      shippingAddress: { street: '56 Nehru Nagar', city: 'Bengaluru', state: 'Karnataka', country: 'India', pincode: '560001' },
      razorpayOrderId: 'order_test_003',
      razorpayPaymentId: 'pay_test_003',
      shippingMethod: 'BlueDart',
      trackingNumber: 'BD123456789',
      items: {
        create: [
          { productVariantId: v('Gold Pendant Necklace', 'Free Size', 'Gold').id, quantity: 1, priceAtPurchase: 1000 },
        ],
      },
    },
  });
  console.log(`  ✅ Order #${order3.id} — SHIPPED — ₹1000 (user: ${user4.name}, tracking: BD123456789)`);

  // Order 4: DELIVERED — user3 (no TG) — completed order
  const order4 = await prisma.order.create({
    data: {
      userId: user3.id,
      status: 'DELIVERED',
      totalAmount: 1899,
      shippingAddress: { street: '23 Anna Salai', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400002' },
      razorpayOrderId: 'order_test_004',
      razorpayPaymentId: 'pay_test_004',
      shippingMethod: 'DTDC',
      trackingNumber: 'DT987654321',
      items: {
        create: [
          { productVariantId: v('Yellow Party Dress', 'M', 'Yellow').id, quantity: 1, priceAtPurchase: 1899 },
        ],
      },
    },
  });
  console.log(`  ✅ Order #${order4.id} — DELIVERED — ₹1899 (user: ${user3.name})`);

  // Order 5: CANCELLED — user1 — for cancelled status test
  const order5 = await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'CANCELLED',
      totalAmount: 800,
      shippingAddress: { street: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', country: 'India', pincode: '400001' },
      razorpayOrderId: 'order_test_005',
      items: {
        create: [
          { productVariantId: v('Crystal Drop Earrings', 'Free Size', 'Silver').id, quantity: 1, priceAtPurchase: 800 },
        ],
      },
    },
  });
  console.log(`  ✅ Order #${order5.id} — CANCELLED — ₹800 (user: ${user1.name})`);

  // ─────────────────────────────────────────────
  // 8. CART ABANDONMENT RECORDS (for reminder testing)
  // ─────────────────────────────────────────────
  console.log('\n🛒 Creating cart abandonment records...');

  // 1 hour ago — should trigger 1h reminder
  const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
  await prisma.cartAbandonment.create({
    data: {
      userId: user1.id,
      cartSnapshot: {
        items: [
          { productId: products[0].id, name: 'Green Embroidered Kurta', size: 'M', color: 'Green', price: 999, quantity: 1 },
        ],
        total: 999,
      },
      createdAt: oneHourAgo,
    },
  });
  console.log('  ✅ Cart abandonment: user1 — 1hr ago (should trigger 1h reminder)');

  // 25 hours ago — should trigger 24h reminder
  const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
  await prisma.cartAbandonment.create({
    data: {
      userId: user2.id,
      cartSnapshot: {
        items: [
          { productId: products[2].id, name: 'Blue Cotton Set', size: 'S', color: 'Blue', price: 1299, quantity: 1 },
          { productId: products[5].id, name: 'Crystal Drop Earrings', size: 'Free Size', color: 'Silver', price: 800, quantity: 2 },
        ],
        total: 2899,
      },
      createdAt: twentyFiveHoursAgo,
    },
  });
  console.log('  ✅ Cart abandonment: user2 — 25hrs ago (should trigger 24h reminder)');

  // 4 days ago — should trigger 3d reminder
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
  await prisma.cartAbandonment.create({
    data: {
      userId: user4.id,
      cartSnapshot: {
        items: [
          { productId: products[4].id, name: 'Gold Pendant Necklace', size: 'Free Size', color: 'Gold', price: 1000, quantity: 1 },
        ],
        total: 1000,
      },
      createdAt: fourDaysAgo,
    },
  });
  console.log('  ✅ Cart abandonment: user4 — 4 days ago (should trigger 3d reminder)');

  // ─────────────────────────────────────────────
  // 9. SCHEDULED MESSAGES (for promo broadcast testing)
  // ─────────────────────────────────────────────
  console.log('\n📨 Creating scheduled messages...');

  // Send immediately (1 min from now)
  await prisma.scheduledMessage.create({
    data: {
      title: 'Monsoon Sale!',
      message: '🌧️ Monsoon Sale is LIVE!\n\nGet up to 40% off on all Kurtas and Sets.\n\nShop now before stocks run out!',
      buttonLabel: 'Shop Now',
      buttonUrl: 'https://srishtique.com/clothes',
      scheduledAt: new Date(Date.now() + 1 * 60 * 1000), // 1 min from now
      status: 'PENDING',
      targetType: 'ALL_LINKED',
    },
  });
  console.log('  ✅ Scheduled message: "Monsoon Sale!" — PENDING, sends in 1 min to ALL_LINKED');

  // Scheduled for later today
  const laterToday = new Date();
  laterToday.setHours(laterToday.getHours() + 3, 0, 0, 0);
  await prisma.scheduledMessage.create({
    data: {
      title: 'Flash Deal — Earrings',
      message: '⚡ FLASH DEAL!\n\nCrystal Drop Earrings now at ₹699 (was ₹1200)\n\nOnly 25 pieces left!',
      imageUrl: 'https://example.com/earring_promo.png',
      buttonLabel: 'Grab Deal',
      buttonUrl: 'https://srishtique.com/ornaments',
      scheduledAt: laterToday,
      status: 'PENDING',
      targetType: 'ALL_LINKED',
    },
  });
  console.log(`  ✅ Scheduled message: "Flash Deal" — PENDING, scheduled for ${laterToday.toLocaleTimeString()}`);

  // Specific users target
  await prisma.scheduledMessage.create({
    data: {
      title: 'VIP Early Access',
      message: '🎉 Hey VIP!\n\nYou\'re getting early access to our new Collection.\n\nUse code VIP20 for extra 20% off!',
      buttonLabel: 'View Collection',
      buttonUrl: 'https://srishtique.com/new-arrivals',
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'PENDING',
      targetType: 'SPECIFIC_USERS',
      targetUserIds: [user1.id, user2.id],
    },
  });
  console.log('  ✅ Scheduled message: "VIP Early Access" — PENDING, targets user1 + user2');

  // Already sent message
  await prisma.scheduledMessage.create({
    data: {
      title: 'Welcome Offer',
      message: '🎁 Welcome to Srishtique!\n\nHere\'s 10% off your first order.\nUse code WELCOME10 at checkout.',
      buttonLabel: 'Shop Now',
      buttonUrl: 'https://srishtique.com',
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'SENT',
      targetType: 'ALL_LINKED',
      sentAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      sentCount: 3,
      failedCount: 0,
    },
  });
  console.log('  ✅ Scheduled message: "Welcome Offer" — SENT (already delivered)');

  // ─────────────────────────────────────────────
  // 10. FESTIVAL MESSAGES
  // ─────────────────────────────────────────────
  console.log('\n🎊 Creating festival messages...');

  // Scheduled for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  await prisma.festivalMessage.create({
    data: {
      name: 'Diwali Special',
      message: '🪔 Happy Diwali from Srishtique!\n\nLight up your festivities with our exclusive Diwali Collection.\n\nFlat 30% off on all Ornaments!',
      imageUrl: 'https://example.com/diwali_banner.png',
      buttonLabel: 'Shop Diwali Collection',
      buttonUrl: 'https://srishtique.com/ornaments',
      scheduledDate: tomorrow,
      status: 'SCHEDULED',
    },
  });
  console.log(`  ✅ Festival message: "Diwali Special" — SCHEDULED for ${tomorrow.toLocaleDateString()} 9:00 AM`);

  // Draft festival message
  await prisma.festivalMessage.create({
    data: {
      name: 'Christmas Sale',
      message: '🎄 Merry Christmas!\n\nCelebrate with our Christmas Special Collection.\n\nBuy 2 Get 1 Free on all Dresses!',
      buttonLabel: 'View Dresses',
      buttonUrl: 'https://srishtique.com/dresses',
      scheduledDate: new Date('2026-12-25'),
      status: 'DRAFT',
    },
  });
  console.log('  ✅ Festival message: "Christmas Sale" — DRAFT (not scheduled yet)');

  // ─────────────────────────────────────────────
  // 11. COUPONS
  // ─────────────────────────────────────────────
  console.log('\n🏷️  Creating coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderValue: 500,
        maxDiscount: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        isFirstPurchaseOnly: true,
        isActive: true,
      },
      {
        code: 'MONSOON40',
        discountType: 'PERCENTAGE',
        discountValue: 40,
        minOrderValue: 1000,
        maxDiscount: 500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        usageLimit: 50,
        isFirstPurchaseOnly: false,
        isActive: true,
      },
      {
        code: 'FLAT200',
        discountType: 'FIXED',
        discountValue: 200,
        minOrderValue: 1500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 30,
        isFirstPurchaseOnly: false,
        isActive: true,
      },
    ],
  });
  console.log('  ✅ 3 coupons created: WELCOME10, MONSOON40, FLAT200');

  // ─────────────────────────────────────────────
  // 12. TESTIMONIALS
  // ─────────────────────────────────────────────
  console.log('\n💬 Creating testimonials...');
  await prisma.testimonial.createMany({
    data: [
      { name: 'Priya S.', rating: 5, text: 'Amazing quality! The kurta fabric is so soft and the embroidery is beautiful. Will order again!' },
      { name: 'Rahul V.', rating: 5, text: 'Bought earrings for my wife. She loved them! Great packaging and fast delivery.' },
      { name: 'Anita P.', rating: 4, text: 'Nice collection. The dress fit perfectly. Only wish there were more color options.' },
      { name: 'Vikram S.', rating: 5, text: 'Best online shopping experience. Customer support was very helpful with sizing.' },
      { name: 'Meera K.', rating: 5, text: 'The necklace is exactly as shown in the picture. Premium quality at reasonable price.' },
    ],
  });
  console.log('  ✅ 5 testimonials created');

  // ─────────────────────────────────────────────
  // 13. SITE SETTINGS
  // ─────────────────────────────────────────────
  console.log('\n⚙️  Creating site settings...');
  await prisma.siteSettings.createMany({
    data: [
      { key: 'HERO_BANNER_URL', value: 'srishtique/banners/hero_banner.png' },
      { key: 'OCCASION_BANNER_URL', value: 'srishtique/banners/maternity_banner.png' },
      { key: 'STORE_NAME', value: 'Srishtique - Adorn Your Aura' },
      { key: 'STORE_EMAIL', value: 'support@srishtique.com' },
      { key: 'STORE_PHONE', value: '+91 98765 43210' },
    ],
  });
  console.log('  ✅ 5 site settings created');

  // ─────────────────────────────────────────────
  // 14. ADMIN GENERAL SETTINGS
  // ─────────────────────────────────────────────
  console.log('\n🔧 Creating admin general settings...');
  const indiaCountry = await prisma.country.findUnique({ where: { name: 'India' } });
  await prisma.adminGeneralSetting.create({
    data: {
      defaultCountryId: indiaCountry?.id || 1,
      twoFactorApiKey: 'test_api_key',
      loginOtpTemplate: 'Your OTP is {{otp}}. Valid for 10 minutes.',
      msg91AuthKey: 'test_msg91_auth_key',
      msg91Template: 'test_template_id',
    },
  });
  console.log('  ✅ Admin general settings created');

  // ─────────────────────────────────────────────
  // 15. STATIC PAGE SEO
  // ─────────────────────────────────────────────
  console.log('\n🔍 Creating SEO entries...');
  await prisma.staticPageSeo.createMany({
    data: [
      { pagePath: '/', metaTitle: 'Srishtique - Adorn Your Aura | Premium Clothing & Ornaments', metaDescription: 'Shop premium handcrafted clothing and ornaments at Srishtique. Kurtas, sets, dresses, necklaces, earrings and more.' },
      { pagePath: '/about', metaTitle: 'About Us - Srishtique', metaDescription: 'Learn about Srishtique, our story, and our commitment to quality craftsmanship.' },
      { pagePath: '/contact', metaTitle: 'Contact Us - Srishtique', metaDescription: 'Get in touch with Srishtique for orders, support, or inquiries.' },
      { pagePath: '/faqs', metaTitle: 'FAQs - Srishtique', metaDescription: 'Frequently asked questions about shopping, orders, shipping, and returns at Srishtique.' },
    ],
  });
  console.log('  ✅ 4 SEO entries created');

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────
  console.log('\n' + '═'.repeat(50));
  console.log('🎉 SEED COMPLETE!');
  console.log('═'.repeat(50));
  console.log(`
📊 Summary:
  • 1 Admin user (phone: 9999999999, password: Admin@123)
  • 5 Test users (3 with Telegram linked, 2 without)
  • 5 Categories (3 clothing, 2 ornaments)
  • 3 Occasions (Festival, Office, Maternity)
  • 6 Products with variants
  • 5 Orders (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
  • 3 Cart abandonment records (1h, 25h, 4 days ago)
  • 4 Scheduled messages (2 PENDING, 1 SENT, 1 VIP)
  • 2 Festival messages (1 SCHEDULED, 1 DRAFT)
  • 3 Coupons (WELCOME10, MONSOON40, FLAT200)
  • 5 Testimonials
  • 5 Site settings
  • 4 SEO entries

🔑 Login credentials:
  Admin:  phone=9999999999 password=Admin@123
  User1:  phone=9876543210 password=User@123 (TG linked)
  User2:  phone=9876543211 password=User@123 (TG linked)
  User3:  phone=9876543212 password=User@123 (no TG)
  User4:  phone=9876543213 password=User@123 (TG linked)
  User5:  phone=9876543214 (guest, no password)

📨 To test Telegram features:
  1. Scheduled messages cron picks up "Monsoon Sale!" in ~1 min
  2. Cart abandonment cron will send reminders to linked users
  3. Update order status via admin API to trigger TG notifications
  4. Festival message "Diwali Special" sends tomorrow at 9 AM
`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
