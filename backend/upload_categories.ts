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
  s3ForcePathStyle: false, // Some S3 compatible endpoints require this, but digital ocean usually works with default
});

const files = [
  'category_pendants.png',
  'category_chains.png',
  'category_bracelets.png',
  'category_mangalsutras.png',
  'category_nose_rings.png'
];

async function upload() {
  for (const file of files) {
    const filePath = path.join(__dirname, 'public/uploads/srishtique/categories', file);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: process.env.DO_BUCKET!,
      Key: `srishtique/categories/${file}`,
      Body: fileStream,
      ACL: 'public-read',
      ContentType: 'image/png'
    };
    try {
      const data = await s3.upload(uploadParams).promise();
      console.log(`Uploaded ${file} to ${data.Key}`);
    } catch (err) {
      console.error(`Failed to upload ${file}:`, err);
    }
  }
}

upload();
