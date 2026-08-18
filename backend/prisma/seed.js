"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting seeding...');
        yield prisma.orderItem.deleteMany({});
        yield prisma.order.deleteMany({});
        yield prisma.wishlist.deleteMany({});
        yield prisma.productVariant.deleteMany({});
        yield prisma.product.deleteMany({});
        // 1. Create Site Settings
        yield prisma.siteSettings.upsert({
            where: { key: 'HERO_BANNER_URL' },
            update: { value: 'srishtique/banners/hero_banner.png' },
            create: { key: 'HERO_BANNER_URL', value: 'srishtique/banners/hero_banner.png' }
        });
        yield prisma.siteSettings.upsert({
            where: { key: 'OCCASION_BANNER_URL' },
            update: { value: 'srishtique/banners/maternity_banner.png' },
            create: { key: 'OCCASION_BANNER_URL', value: 'srishtique/banners/maternity_banner.png' }
        });
        // 2. Create Categories
        const categoryKurtas = yield prisma.category.upsert({
            where: { slug: 'kurtas' },
            update: { image: 'srishtique/categories/category_kurtas.png' },
            create: {
                name: 'Kurtas',
                slug: 'kurtas',
                image: 'srishtique/categories/category_kurtas.png'
            }
        });
        const categorySets = yield prisma.category.upsert({
            where: { slug: 'sets' },
            update: { image: 'srishtique/categories/category_kurtas.png' },
            create: {
                name: 'Sets',
                slug: 'sets',
                image: 'srishtique/categories/category_kurtas.png'
            }
        });
        const categoryDresses = yield prisma.category.upsert({
            where: { slug: 'dresses' },
            update: { image: 'srishtique/categories/category_kurtas.png' },
            create: {
                name: 'Dresses',
                slug: 'dresses',
                image: 'srishtique/categories/category_kurtas.png'
            }
        });
        // 2. Create Occasions
        const occasionFestival = yield prisma.occasion.upsert({
            where: { slug: 'festival' },
            update: { image: 'srishtique/occasions/occasion_festival.png', heroImage: 'srishtique/banners/hero_banner.png' },
            create: {
                name: 'Festival',
                slug: 'festival',
                image: 'srishtique/occasions/occasion_festival.png',
                heroImage: 'srishtique/banners/hero_banner.png'
            }
        });
        const occasionOffice = yield prisma.occasion.upsert({
            where: { slug: 'office' },
            update: { image: 'srishtique/occasions/occasion_festival.png', heroImage: null },
            create: {
                name: 'Office',
                slug: 'office',
                image: 'srishtique/occasions/occasion_festival.png',
                heroImage: null
            }
        });
        const occasionMaternity = yield prisma.occasion.upsert({
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
        const product1 = yield prisma.product.create({
            data: {
                name: 'Green Embroidered Kurta',
                description: 'A beautiful green embroidered kurta perfect for festivals.',
                images: ['srishtique/products/product_1.png'],
                categoryId: categoryKurtas.id,
                occasionId: occasionFestival.id,
                isNewArrival: true,
                isTrending: true,
                variants: {
                    create: [{ size: 'M', color: 'Green', price: 999, originalPrice: 1299, stock: 10 }]
                }
            }
        });
        console.log(`Created product: ${product1.name}`);
        const product2 = yield prisma.product.create({
            data: {
                name: 'Red Silk Kurti',
                description: 'Elegant red silk kurti for special occasions.',
                images: ['srishtique/products/product_2.png'],
                categoryId: categoryKurtas.id,
                occasionId: occasionFestival.id,
                isNewArrival: true,
                isTrending: true,
                variants: {
                    create: [{ size: 'L', color: 'Red', price: 1499, originalPrice: 1999, stock: 5 }]
                }
            }
        });
        console.log(`Created product: ${product2.name}`);
        const product3 = yield prisma.product.create({
            data: {
                name: 'Blue Cotton Set',
                description: 'Comfortable blue cotton set for everyday office wear.',
                images: ['srishtique/products/product_3.png'],
                categoryId: categorySets.id,
                occasionId: occasionOffice.id,
                isTrending: true,
                variants: {
                    create: [{ size: 'S', color: 'Blue', price: 1299, originalPrice: 1599, stock: 8 }]
                }
            }
        });
        console.log(`Created product: ${product3.name}`);
        const product4 = yield prisma.product.create({
            data: {
                name: 'Yellow Party Dress',
                description: 'Vibrant yellow dress for parties and casual outings.',
                images: ['srishtique/products/product_4.png'],
                categoryId: categoryDresses.id,
                occasionId: occasionFestival.id,
                isNewArrival: true,
                isTrending: true,
                variants: {
                    create: [{ size: 'M', color: 'Yellow', price: 1899, originalPrice: 2499, stock: 12 }]
                }
            }
        });
        console.log(`Created product: ${product4.name}`);
        const product5 = yield prisma.product.create({
            data: {
                name: 'White Floral Kurta',
                description: 'Simple and elegant white floral kurta.',
                images: ['srishtique/products/product_5.png'],
                categoryId: categoryKurtas.id,
                occasionId: occasionOffice.id,
                isTrending: true,
                variants: {
                    create: [{ size: 'XL', color: 'White', price: 899, originalPrice: 1099, stock: 15 }]
                }
            }
        });
        console.log(`Created product: ${product5.name}`);
        const product6 = yield prisma.product.create({
            data: {
                name: 'Black Premium Kurti',
                description: 'Premium black kurti with intricate detailing.',
                images: ['srishtique/products/product_6.png'],
                categoryId: categoryKurtas.id,
                occasionId: occasionFestival.id,
                isNewArrival: true,
                isTrending: true,
                variants: {
                    create: [{ size: 'M', color: 'Black', price: 1699, originalPrice: 2199, stock: 7 }]
                }
            }
        });
        console.log(`Created product: ${product6.name}`);
        const product7 = yield prisma.product.create({
            data: {
                name: 'Readymade Cotton Cord Set',
                description: 'Premium maternity friendly cotton cord set.',
                images: ['srishtique/products/product_main.png', 'srishtique/products/product_side.png'],
                categoryId: categorySets.id,
                occasionId: occasionMaternity.id,
                isNewArrival: true,
                isTrending: true,
                variants: {
                    create: [{ size: 'M', color: 'Teal', price: 2199, originalPrice: 2999, stock: 20 }]
                }
            }
        });
        console.log(`Created product: ${product7.name}`);
        // 4. Create Countries, States, and Cities
        console.log('Seeding countries, states, and cities...');
        // Clear existing to avoid duplicate key errors on repeated seeds
        yield prisma.city.deleteMany({});
        yield prisma.state.deleteMany({});
        yield prisma.country.deleteMany({});
        yield prisma.country.create({
            data: {
                name: 'India',
                states: {
                        { name: 'Maharashtra' },
                        { name: 'Karnataka' },
                        { name: 'Delhi' }
                    ]
                }
            }
        });
        yield prisma.country.create({
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
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
