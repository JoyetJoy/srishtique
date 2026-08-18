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

  const params = {
    Bucket: process.env.DO_BUCKET || '',
    Key: key,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentType: mimeType,
  };

  await s3.putObject(params).promise();
  return key;
}

const CATEGORIES = [
  { name: 'Tops', imageFile: 'Group 1.png', type: 'CLOTHING' },
  { name: 'Night Wears', imageFile: 'Group 2.png', type: 'CLOTHING' },
  { name: 'Coord sets', imageFile: 'Group 3.png', type: 'CLOTHING' },
  { name: 'Maternity Wears', imageFile: 'Group 4.png', type: 'CLOTHING' },
  { name: 'Frocks', imageFile: 'Group 5.png', type: 'CLOTHING' },
  { name: 'Kurtas', imageFile: 'Screenshot_20260713_132241 1.png', type: 'CLOTHING' },
  { name: 'Sets', imageFile: 'Screenshot_20260713_132252 1.png', type: 'CLOTHING' },
  { name: 'Dresses', imageFile: 'Screenshot_20260713_132304 1.png', type: 'CLOTHING' },
  { name: 'Sarees', imageFile: 'Screenshot_20260713_132332 1.png', type: 'CLOTHING' },
  { name: 'Kurtis', imageFile: 'Screenshot_20260713_132349 1.png', type: 'CLOTHING' },
  { name: 'Lehengas', imageFile: 'Screenshot_20260713_132502 1.png', type: 'CLOTHING' }
];

const PRODUCT_FILES = [
  'Screenshot_20260713_132241 1.png',
  'Screenshot_20260713_132252 1.png',
  'Screenshot_20260713_132304 1.png',
  'Screenshot_20260713_132332 1.png',
  'Screenshot_20260713_132349 1.png',
  'Screenshot_20260713_132502 1.png',
  'Screenshot_20260713_132513 1.png',
  'Screenshot_20260713_132521 1.png',
  'Screenshot_20260713_132535 2.png',
  'Screenshot_20260713_132547 1.png',
  'Screenshot_20260713_132611 2.png',
  'Screenshot_20260713_132631 1.png'
];

async function seed() {
  console.log('Starting local seed process...');
  const baseDir = 'C:\\Users\\butom\\Downloads\\srishtique';

  try {
    // Stage 1: Upload images
    console.log('--- STAGE 1: Uploading Images ---');
    const categoryData: any[] = [];
    
    for (const cat of CATEGORIES) {
      console.log(`Uploading image for category: ${cat.name}`);
      const filePath = path.join(baseDir, cat.imageFile);
      let catImageKey = null;
      if (fs.existsSync(filePath)) {
        catImageKey = await uploadLocalImage(filePath, 'categories');
      }

      const products = [];
      for (let i = 1; i <= 3; i++) {
        const randomFile = PRODUCT_FILES[Math.floor(Math.random() * PRODUCT_FILES.length)];
        const prodPath = path.join(baseDir, randomFile);
        if (fs.existsSync(prodPath)) {
          const prodImageKey = await uploadLocalImage(prodPath, 'products');
          products.push(prodImageKey);
        }
      }
      categoryData.push({ cat, catImageKey, products });
    }

    // Stage 2: Database Operations
    console.log('--- STAGE 2: Inserting records into Database ---');
    
    for (const data of categoryData) {
      console.log(`Saving category: ${data.cat.name}`);
      const category = await prisma.category.create({
        data: {
          name: data.cat.name,
          slug: data.cat.name.toLowerCase().replace(/\\s+/g, '-'),
          type: data.cat.type,
          image: data.catImageKey,
          metaTitle: `${data.cat.name} Collection`,
          metaDescription: `Shop the latest ${data.cat.name} at SRISHTIQUE.`,
        }
      });

      for (let i = 1; i <= data.products.length; i++) {
        await prisma.product.create({
          data: {
            name: `Premium ${data.cat.name} ${i}`,
            description: `This is a beautifully crafted ${data.cat.name.toLowerCase()} perfect for any occasion. Made with high quality materials.`,
            type: data.cat.type,
            categoryId: category.id,
            images: [data.products[i-1]],
            variants: {
              create: [
                { size: 'M', color: 'Red', price: 1500 + (i * 100), originalPrice: 2000 + (i * 100), stock: 10, sku: `CL-${data.cat.name.substring(0,3).toUpperCase()}-${i}M-RED-${Date.now()}` },
                { size: 'L', color: 'Blue', price: 1500 + (i * 100), originalPrice: 2000 + (i * 100), stock: 5, sku: `CL-${data.cat.name.substring(0,3).toUpperCase()}-${i}L-BLU-${Date.now()}` }
              ]
            }
          }
        });
      }
    }

    console.log('Local seed completed successfully!');
  } catch (error) {
    console.error('Local seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
