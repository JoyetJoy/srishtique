const fs = require('fs');
let content = fs.readFileSync('src/components/ProductInfo.tsx', 'utf8');

// 1. Add import
if (!content.includes("import { getImageUrl }")) {
  content = content.replace(
    "import CheckoutDrawer from './CheckoutDrawer';",
    "import CheckoutDrawer from './CheckoutDrawer';\nimport { getImageUrl } from '../utils/imageUrl';"
  );
}

// 2. Fix the image src
content = content.replace(
  "src={sizeChartUrl.startsWith('http') ? sizeChartUrl : `${API_URL}${sizeChartUrl}`}",
  "src={getImageUrl(sizeChartUrl)}"
);

fs.writeFileSync('src/components/ProductInfo.tsx', content);
