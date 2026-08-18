const fs = require('fs');
let content = fs.readFileSync('src/components/ProductInfo.tsx', 'utf8');

// 1. Remove isSizeChartOpen
content = content.replace(/  const \[isSizeChartOpen, setIsSizeChartOpen\] = useState\(false\);[\r\n]+/, '');

// 2. Remove modal logic at the bottom
const modalRegex = /        \{\/\* Size Chart Modal \*\/\}.*?        \}/s;
content = content.replace(modalRegex, '');
// just in case it doesn't match, let's use a split approach or more precise regex
content = content.replace(/        \{\/\* Size Chart Modal \*\/\}[\s\S]*?        \}/, '');

// 3. Remove "Size Chart" button next to "Select Size"
const sizeChartButtonRegex = /        \{sizeChartUrl && \([\s\S]*?        \)\}/;
content = content.replace(sizeChartButtonRegex, '');

// 4. Update accordions definition
const oldAccordions = `  const accordions = [
    { 
      title: 'Product Details',`;
const newAccordions = `  const baseAccordions = [
    { 
      title: 'Product Details',`;

content = content.replace(oldAccordions, newAccordions);

// 5. Append Size Chart to accordions
const newAccordionsEnd = `    { title: 'Shipping', content: <p className="details-text">Free shipping on orders above ₹999. Standard delivery within 3-5 business days.</p> },
    { title: 'Additional Information', content: <p className="details-text">Machine wash cold with like colors. Do not bleach. Tumble dry low.</p> }
  ];`;

const newAccordionsEndReplacement = `    { title: 'Shipping', content: <p className="details-text">Free shipping on orders above ₹999. Standard delivery within 3-5 business days.</p> },
    { title: 'Additional Information', content: <p className="details-text">Machine wash cold with like colors. Do not bleach. Tumble dry low.</p> }
  ];

  const accordions = sizeChartUrl 
    ? [
        { 
          title: 'Size Chart', 
          content: (
            <div style={{ padding: '10px 0' }}>
              <img src={sizeChartUrl.startsWith('http') ? sizeChartUrl : \`\${API_URL}\${sizeChartUrl}\`} alt="Size Chart" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
            </div>
          )
        },
        ...baseAccordions
      ]
    : baseAccordions;`;

content = content.replace(newAccordionsEnd, newAccordionsEndReplacement);

fs.writeFileSync('src/components/ProductInfo.tsx', content);
