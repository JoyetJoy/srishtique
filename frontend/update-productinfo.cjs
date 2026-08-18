const fs = require('fs');
let content = fs.readFileSync('src/components/ProductInfo.tsx', 'utf8');

// 1. Add state for size chart
content = content.replace(
  "const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);",
  "const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);\n  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);"
);

// 2. Compute size chart URL
content = content.replace(
  "const matchingVariant = product?.variants?.find(",
  "const sizeChartUrl = product?.sizeChart || product?.category?.sizeChart;\n\n  const matchingVariant = product?.variants?.find("
);

// 3. Update Select Size header to include the button
const selectSizeJSX = `      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="selector-label" style={{ margin: 0 }}>Select Size</span>
        {sizeChartUrl && (
          <button 
            type="button" 
            onClick={() => setIsSizeChartOpen(true)}
            style={{ background: 'none', border: 'none', color: 'var(--maroon)', textDecoration: 'underline', fontSize: '14px', cursor: 'pointer', padding: 0 }}
          >
            Size Chart
          </button>
        )}
      </div>`;
      
content = content.replace(
  "<span className=\"selector-label\">Select Size</span>",
  selectSizeJSX
);

// 4. Add the modal at the end before returning
const modalJSX = `
      {isSizeChartOpen && sizeChartUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', maxWidth: '600px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setIsSizeChartOpen(false)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}
            >
              &times;
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Size Chart</h3>
            <img src={sizeChartUrl.startsWith('http') ? sizeChartUrl : \`\${API_URL}\${sizeChartUrl}\`} alt="Size Chart" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      )}
`;

content = content.replace(
  "      <CheckoutDrawer",
  modalJSX + "\n      <CheckoutDrawer"
);

fs.writeFileSync('src/components/ProductInfo.tsx', content);
