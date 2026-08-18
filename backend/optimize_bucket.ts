import AWS from 'aws-sdk';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

const spacesEndpoint = new AWS.Endpoint(process.env.DO_ENDPOINT || '');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_KEY,
  secretAccessKey: process.env.DO_SECRET,
});

const BUCKET = process.env.DO_BUCKET || '';

async function optimizeImages() {
  console.log('Fetching objects from bucket:', BUCKET);
  let isTruncated = true;
  let marker: string | undefined = undefined;

  while (isTruncated) {
    const response = await s3.listObjectsV2({
      Bucket: BUCKET,
      Prefix: 'srishtique/',
      ContinuationToken: marker
    }).promise();

    if (!response.Contents) break;

    for (const object of response.Contents) {
      if (!object.Key) continue;
      if (object.Size && object.Size < 300 * 1024) {
        // Skip if less than 300KB
        continue;
      }
      
      if (object.Key.endsWith('.png') || object.Key.endsWith('.jpg') || object.Key.endsWith('.jpeg')) {
        console.log(`Optimizing ${object.Key} (${(object.Size! / 1024 / 1024).toFixed(2)} MB)...`);
        try {
          const fileObj = await s3.getObject({ Bucket: BUCKET, Key: object.Key }).promise();
          if (!fileObj.Body) continue;

          let buffer = fileObj.Body as Buffer;
          
          let sharpInstance = sharp(buffer).resize({ width: 1000, withoutEnlargement: true });
          
          if (object.Key.endsWith('.png')) {
            buffer = await sharpInstance.png({ quality: 80, compressionLevel: 9, palette: true }).toBuffer();
          } else {
            buffer = await sharpInstance.jpeg({ quality: 80 }).toBuffer();
          }

          console.log(`Optimized ${object.Key}, new size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

          await s3.putObject({
            Bucket: BUCKET,
            Key: object.Key,
            Body: buffer,
            ACL: 'public-read',
            ContentType: object.Key.endsWith('.png') ? 'image/png' : 'image/jpeg'
          }).promise();
          console.log(`Re-uploaded ${object.Key}`);
        } catch (err: any) {
          console.error(`Error optimizing ${object.Key}:`, err.message);
        }
      }
    }

    isTruncated = response.IsTruncated || false;
    marker = response.NextContinuationToken;
  }
  console.log('Finished optimizing images.');
}

optimizeImages().catch(console.error);
