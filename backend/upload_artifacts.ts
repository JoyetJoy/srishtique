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

const artifactDir = 'C:\\Users\\butom\\.gemini\\antigravity-ide\\brain\\8378d059-aca6-4f7f-b94e-e07f2bf42e2c';

const mappings = [
  { file: 'category_bracelets_1786100335852.png', key: 'srishtique/categories/category_bracelets.png' },
  { file: 'category_chains_1786100323961.png', key: 'srishtique/categories/category_chains.png' },
  { file: 'category_mangalsutras_1786100347880.png', key: 'srishtique/categories/category_mangalsutras.png' },
  { file: 'category_nose_rings_1786100358189.png', key: 'srishtique/categories/category_nose_rings.png' },
  { file: 'category_pendants_1786100311878.png', key: 'srishtique/categories/category_pendants.png' },
  { file: 'prod_anklet_1786101129354.png', key: 'srishtique/products/prod_anklet.png' },
  { file: 'prod_bangle_1786101100827.png', key: 'srishtique/products/prod_bangle.png' },
  { file: 'prod_chain_1786101155263.png', key: 'srishtique/products/prod_chain.png' },
  { file: 'prod_earring_1786101074524.png', key: 'srishtique/products/prod_earring.png' },
  { file: 'prod_necklace_1786101062545.png', key: 'srishtique/products/prod_necklace.png' },
  { file: 'prod_pendant_1786101143757.png', key: 'srishtique/products/prod_pendant.png' },
  { file: 'prod_ring_1786101113078.png', key: 'srishtique/products/prod_ring.png' }
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
      ContentType: 'image/png'
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
