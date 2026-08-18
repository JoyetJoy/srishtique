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

const files = [
  'prod_necklace.png',
  'prod_earring.png',
  'prod_bangle.png',
  'prod_ring.png',
  'prod_anklet.png',
  'prod_pendant.png',
  'prod_chain.png'
];

async function upload() {
  for (const file of files) {
    const filePath = path.join(__dirname, 'public/uploads/srishtique/products', file);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: process.env.DO_BUCKET!,
      Key: `srishtique/products/${file}`,
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
