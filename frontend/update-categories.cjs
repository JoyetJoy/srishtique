const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCategories.tsx', 'utf8');

content = content.replace(
  "const [image, setImage] = useState('');\n  const [imageFile, setImageFile] = useState<File | null>(null);",
  "const [image, setImage] = useState('');\n  const [imageFile, setImageFile] = useState<File | null>(null);\n  const [sizeChart, setSizeChart] = useState('');\n  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);"
);

content = content.replace(
  "setImage('');\n    setImageFile(null);",
  "setImage('');\n    setImageFile(null);\n    setSizeChart('');\n    setSizeChartFile(null);"
);

content = content.replace(
  "setImage(cat.image || '');\n    setImageFile(null);",
  "setImage(cat.image || '');\n    setImageFile(null);\n    setSizeChart(cat.sizeChart || '');\n    setSizeChartFile(null);"
);

content = content.replace(
  /let finalImageUrl = image;\n\n      if \(imageFile\) {/g,
  "let finalImageUrl = image;\n      let finalSizeChartUrl = sizeChart;\n\n      if (sizeChartFile) {\n        const fd = new FormData();\n        fd.append('image', sizeChartFile);\n        fd.append('folder', 'size-charts');\n        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {\n          method: 'POST',\n          headers: { 'Authorization': `Bearer ${localStorage.getItem('srishtique_token')}` },\n          body: fd\n        });\n        const d = await res.json();\n        finalSizeChartUrl = d.url;\n      }\n\n      if (imageFile) {"
);

content = content.replace(
  "body: JSON.stringify({ name, slug, image: finalImageUrl, type, metaTitle, metaDescription, metaKeywords })",
  "body: JSON.stringify({ name, slug, image: finalImageUrl, sizeChart: finalSizeChartUrl, type, metaTitle, metaDescription, metaKeywords })"
);

const sizeChartJSX = `                <div className="admin-form-group">
                  <label>Size Chart Upload (optional) - Fallback for products</label>
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
  "                <div className=\"admin-form-group\">\n                  <label>Image Upload",
  sizeChartJSX + "                <div className=\"admin-form-group\">\n                  <label>Image Upload"
);

fs.writeFileSync('src/pages/admin/AdminCategories.tsx', content);
