import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT!);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_KEY,
  secretAccessKey: process.env.DO_SECRET,
  s3ForcePathStyle: false,
});

const artifactDir = 'C:\\Users\\Btm24\\.gemini\\antigravity\\brain\\1c8ea7ea-eba8-470f-a042-e77a043dde03';

const mappings = [
  { file: 'black_pepper_1786959144167.jpg', key: 'dk_exporting/products/black_pepper.jpg' },
  { file: 'cashew_nuts_1786959062305.jpg', key: 'dk_exporting/products/cashew_nuts.jpg' },
  { file: 'green_cardamom_1786959159781.jpg', key: 'dk_exporting/products/green_cardamom.jpg' },
  { file: 'cashew_nuts_1786959062305.jpg', key: 'dk_exporting/products/peri_peri_cashew.jpg' },
  { file: 'cashew_nuts_1786959062305.jpg', key: 'dk_exporting/banners/hero_banner.jpg' },
];

async function upload() {
  for (const map of mappings) {
    const filePath = path.join(artifactDir, map.file);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: process.env.DO_BUCKET!,
      Key: map.key,
      Body: fileStream,
      ACL: 'public-read',
      ContentType: 'image/jpeg'
    };
    try {
      const data = await s3.upload(uploadParams).promise();
      console.log(`Uploaded ${map.file} to ${data.Key}`);
    } catch (err) {
      console.error(`Failed to upload ${map.file}:`, err);
    }
  }
}

upload();
