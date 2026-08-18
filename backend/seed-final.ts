import { PrismaClient } from '@prisma/client';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT || '');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_KEY,
  secretAccessKey: process.env.DO_SECRET,
});

async function uploadLocalImage(filePath: string, folder: string): Promise<string> {
  const fileExtension = path.extname(filePath);
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
  const key = `srishtique/${folder}/${fileName}`;
  const fileBuffer = fs.readFileSync(filePath);
  const mimeType = fileExtension.toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
  await s3.putObject({ Bucket: process.env.DO_BUCKET || '', Key: key, Body: fileBuffer, ACL: 'public-read', ContentType: mimeType }).promise();
  return key;
}

const CLOTHING_CATEGORIES = [
  { name: 'Tops', imageFile: 'Group 1.png', type: 'CLOTHING' },
  { name: 'Night Wears', imageFile: 'Group 2.png', type: 'CLOTHING' },
  { name: 'Coord Sets', imageFile: 'Group 3.png', type: 'CLOTHING' },
  { name: 'Maternity Wears', imageFile: 'Group 4.png', type: 'CLOTHING' },
  { name: 'Frocks', imageFile: 'Group 5.png', type: 'CLOTHING' }
];

const ORNAMENT_CATEGORIES = [
  { name: 'Rings', imageFile: 'view-luxurious-golden-ring 1.png', type: 'ORNAMENT' },
  { name: 'Necklaces', imageFile: 'parisa-safaei--_12be3InkQ-unsplash 1.png', type: 'ORNAMENT' },
  { name: 'Bangles', imageFile: 'pexels-jill-burrow-6858599 1.png', type: 'ORNAMENT' },
  { name: 'Earrings', imageFile: 'pexels-svliiim-34399115 1.png', type: 'ORNAMENT' },
  { name: 'Pendants', imageFile: 'ChatGPT Image Jul 21, 2026, 03_21_24 PM 1.png', type: 'ORNAMENT' }
];

async function seed() {
  console.log('Starting full DB reset and final seed...');
  const baseDir = 'C:\\Users\\butom\\Downloads\\srishtique';
  
  try {
    // Wipe DB
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    console.log('Database wiped.');

    const allCategories = [...CLOTHING_CATEGORIES, ...ORNAMENT_CATEGORIES];

    for (const cat of allCategories) {
      const filePath = path.join(baseDir, cat.imageFile);
      let catImageKey = null;
      if (fs.existsSync(filePath)) {
        catImageKey = await uploadLocalImage(filePath, 'categories');
      } else {
        console.warn(`Warning: Image ${cat.imageFile} not found.`);
      }
      
      const category = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
          type: cat.type,
          image: catImageKey,
        }
      });

      // Create 3 products per category
      for (let i = 1; i <= 3; i++) {
        let prodImageKey = null;
        if (fs.existsSync(filePath)) {
          prodImageKey = await uploadLocalImage(filePath, 'products');
        }

        await prisma.product.create({
          data: {
            name: `Elegant ${cat.name} ${i}`,
            description: `A stunning ${cat.name.toLowerCase()} piece for your collection.`,
            type: cat.type,
            categoryId: category.id,
            images: prodImageKey ? [prodImageKey] : [],
            variants: {
              create: [
                { size: cat.type === 'CLOTHING' ? 'M' : 'Free Size', color: 'Standard', price: 1500 + (i * 300), originalPrice: 2000 + (i * 300), stock: 10, sku: `${cat.type.substring(0,2)}-${cat.name.substring(0,3).toUpperCase()}-${i}` }
              ]
            }
          }
        });
      }
    }
    console.log('Final seed completed successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
seed();
