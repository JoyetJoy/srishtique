const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

async function check(file) {
  try {
    const image = await Jimp.read(path.join(__dirname, 'public/new_design', file));
    console.log(`${file}: ${image.bitmap.width}x${image.bitmap.height}`);
  } catch (e) {
    console.log(`Failed for ${file}`);
  }
}

async function main() {
  const files = [
    'logo_mark.png',
    'ancient_emblem.png',
    'logo_header.png',
    'logo.png'
  ];
  for (const f of files) {
    await check(f);
  }
}

main();
