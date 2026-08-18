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
  { name: 'Sarees', imageFile: 'Screenshot_20260713_132332 1.png', type: 'CLOTHING' },
  { name: 'Lehengas', imageFile: 'Screenshot_20260713_132502 1.png', type: 'CLOTHING' },
  { name: 'Kurtis', imageFile: 'Screenshot_20260713_132349 1.png', type: 'CLOTHING' },
  { name: 'Dresses', imageFile: 'Screenshot_20260713_132304 1.png', type: 'CLOTHING' },
  { name: 'Kurtas', imageFile: 'Screenshot_20260713_132241 1.png', type: 'CLOTHING' }
];

async function seed() {
  console.log('Replacing clothing categories with specific images...');
  const baseDir = 'C:\\Users\\butom\\Downloads\\srishtique';
  
  try {
    // Find all clothing categories
    const clothingCategories = await prisma.category.findMany({
      where: { type: 'CLOTHING' }
    });

    const categoryIds = clothingCategories.map(c => c.id);

    if (categoryIds.length > 0) {
      // Find products to delete their variants first
      const products = await prisma.product.findMany({
        where: { categoryId: { in: categoryIds } }
      });
      const productIds = products.map(p => p.id);
      
      await prisma.productVariant.deleteMany({
        where: { productId: { in: productIds } }
      });
      await prisma.product.deleteMany({
        where: { categoryId: { in: categoryIds } }
      });
      await prisma.category.deleteMany({
        where: { id: { in: categoryIds } }
      });
    }

    for (const cat of CLOTHING_CATEGORIES) {
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
                { size: 'M', color: 'Standard', price: 1500 + (i * 300), originalPrice: 2000 + (i * 300), stock: 10, sku: `CL-${cat.name.toUpperCase().replace(/\s+/g, '')}-${i}` }
              ]
            }
          }
        });
      }
    }
    console.log('Clothing categories replaced successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
seed();
