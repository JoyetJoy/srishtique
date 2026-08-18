const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');

// 1. Add States (use regex to ignore newlines)
content = content.replace(
  /const \[imageFiles, setImageFiles\] = useState<File\[\]>\(\[\]\);[\r\n]+  const \[existingImages, setExistingImages\] = useState<string\[\]>\(\[\]\);/,
  "const [imageFiles, setImageFiles] = useState<File[]>([]);\n  const [existingImages, setExistingImages] = useState<string[]>([]);\n  const [sizeChart, setSizeChart] = useState('');\n  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);"
);

// 2. Fetch Product
content = content.replace(
  /if \(prod\.images && prod\.images\.length > 0\) setExistingImages\(prod\.images\);/,
  "if (prod.images && prod.images.length > 0) setExistingImages(prod.images);\n        if (prod.sizeChart) setSizeChart(prod.sizeChart);"
);

// 3. Handle Submit
const uploadLogic = `let imageUrls = [...existingImages];
      let finalSizeChartUrl = sizeChart;

      if (sizeChartFile) {
        const formData = new FormData();
        formData.append('image', sizeChartFile);
        formData.append('folder', 'size-charts');
        const uploadRes = await fetch(\`\${import.meta.env.VITE_API_URL}/api/admin/upload\`, {
          method: 'POST',
          headers: { 'Authorization': \`Bearer \${localStorage.getItem('srishtique_token')}\` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        finalSizeChartUrl = uploadData.url;
      }`;
content = content.replace(/let imageUrls = \[\.\.\.existingImages\];/, uploadLogic);

content = content.replace(
  /images: imageUrls,[\r\n]+          productDetails:/,
  "images: imageUrls,\n          sizeChart: finalSizeChartUrl,\n          productDetails:"
);

// 4. UI 
const sizeChartJSX = `                <div className="admin-form-group">
                  <label>Size Chart Upload (optional) - Overrides category size chart</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="file" 
                        className="admin-input" 
                        accept="image/*"
                        onChange={e => setSizeChartFile(e.target.files?.[0] || null)} 
                      />
                    </div>
                    {sizeChart && !sizeChartFile && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={getImageUrl(sizeChart)} alt="Size Chart Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                        <span style={{fontSize: '10px', color: '#64748b', marginTop: '4px'}}>Current</span>
                      </div>
                    )}
                  </div>
                </div>
`;

content = content.replace(
  /                <div className="admin-form-group">[\r\n]+                  <label>Category<\/label>/,
  sizeChartJSX + "                <div className=\"admin-form-group\">\n                  <label>Category</label>"
);

fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', content);
