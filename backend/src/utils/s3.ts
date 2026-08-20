import AWS from 'aws-sdk';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import sharp from 'sharp';

dotenv.config();

const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT || '');

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_KEY,
  secretAccessKey: process.env.DO_SECRET,
});

// Configure Multer storage to memory
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
});

export const uploadToSpaces = async (file: Express.Multer.File, folder: string = 'uploads'): Promise<string> => {
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const key = `dk_exporting/${folder}/${fileName}`;
  
  // Compress and optimize the image using sharp
  const optimizedBuffer = await sharp(file.buffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 80 })
    .toBuffer();

  const params = {
    Bucket: process.env.DO_BUCKET || '',
    Key: key,
    Body: optimizedBuffer,
    ACL: 'public-read',
    ContentType: 'image/webp',
  };

  await s3.putObject(params).promise();
  
  // Return the relative key (e.g. dk_exporting/products/123.jpg)
  return key;
};
