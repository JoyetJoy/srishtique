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

const CATEGORIES = [
  { name: 'Necklaces', imageFile: 'Screenshot_20260713_132513 1.png', type: 'ORNAMENT' },
  { name: 'Earrings', imageFile: 'Screenshot_20260713_132521 1.png', type: 'ORNAMENT' },
  { name: 'Rings', imageFile: 'Screenshot_20260713_132535 2.png', type: 'ORNAMENT' },
  { name: 'Bangles', imageFile: 'Screenshot_20260713_132547 1.png', type: 'ORNAMENT' },
  { name: 'Anklets', imageFile: 'Screenshot_20260713_132611 2.png', type: 'ORNAMENT' },
  { name: 'Pendants', imageFile: 'Screenshot_20260713_132631 1.png', type: 'ORNAMENT' },
  { name: 'Chain', imageFile: 'image 8.png', type: 'ORNAMENT' }
];

const PRODUCT_FILES = [
  'Screenshot_20260713_132513 1.png',
  'Screenshot_20260713_132521 1.png',
  'Screenshot_20260713_132535 2.png',
  'Screenshot_20260713_132547 1.png',
  'Screenshot_20260713_132611 2.png',
  'Screenshot_20260713_132631 1.png',
  'image 8.png'
];

async function seed() {
  console.log('Seeding ornaments...');
  const baseDir = 'C:\\Users\\butom\\Downloads\\srishtique';
  
  try {
    for (const cat of CATEGORIES) {
      const filePath = path.join(baseDir, cat.imageFile);
      let catImageKey = null;
      if (fs.existsSync(filePath)) catImageKey = await uploadLocalImage(filePath, 'categories');
      
      const category = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
          type: cat.type,
          image: catImageKey,
        }
      });

      for (let i = 1; i <= 3; i++) {
        const prodFile = PRODUCT_FILES[Math.floor(Math.random() * PRODUCT_FILES.length)];
        const prodPath = path.join(baseDir, prodFile);
        let prodImageKey = null;
        if (fs.existsSync(prodPath)) prodImageKey = await uploadLocalImage(prodPath, 'products');

        await prisma.product.create({
          data: {
            name: `Beautiful ${cat.name} ${i}`,
            description: `A stunning ${cat.name.toLowerCase()} piece.`,
            type: cat.type,
            categoryId: category.id,
            images: prodImageKey ? [prodImageKey] : [],
            variants: {
              create: [
                { size: 'Free Size', color: 'Gold', price: 2000 + (i * 500), originalPrice: 2500 + (i * 500), stock: 5, sku: `OR-${cat.name.substring(0,3).toUpperCase()}-${i}` }
              ]
            }
          }
        });
      }
    }
    console.log('Ornaments seeded successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
seed();
