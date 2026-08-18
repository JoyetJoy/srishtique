const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');

// 1. Add state variables
content = content.replace(
  "const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);",
  "const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);\n  const [sizeChartMasterId, setSizeChartMasterId] = useState('');\n  const [sizeChartOptions, setSizeChartOptions] = useState<any[]>([]);"
);

// 2. Add fetchSizeCharts
content = content.replace(
  "    if (isEditing) fetchProduct();",
  "    fetchSizeCharts();\n    if (isEditing) fetchProduct();"
);

const fetchSizeChartsFunc = `  const fetchSizeCharts = async () => {
    try {
      const res = await fetch(\`\${import.meta.env.VITE_API_URL}/api/admin/size-charts\`, { headers: { 'Authorization': \`Bearer \${localStorage.getItem('srishtique_token')}\` } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSizeChartOptions(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchProduct = async () => {`;

content = content.replace("  const fetchProduct = async () => {", fetchSizeChartsFunc);

// 3. Set sizeChartMasterId in fetchProduct
content = content.replace(
  "if (prod.sizeChart) setSizeChart(prod.sizeChart);",
  "if (prod.sizeChart) setSizeChart(prod.sizeChart);\n        if (prod.sizeChartMasterId) setSizeChartMasterId(prod.sizeChartMasterId.toString());"
);

// 4. Send sizeChartMasterId in payload
content = content.replace(
  "sizeChart: finalSizeChartUrl,",
  "sizeChart: finalSizeChartUrl,\n          sizeChartMasterId: sizeChartMasterId ? parseInt(sizeChartMasterId, 10) : null,"
);

// 5. Add UI field in JSX
const oldUI = `              <div className="admin-form-group">
                <label>Size Chart Upload (optional) - Overrides category size chart</label>`;

const newUI = `              <div className="admin-form-group">
                <label>Tabular Size Chart Master (optional) - Overrides category master</label>
                <select
                  className="admin-input"
                  value={sizeChartMasterId}
                  onChange={e => setSizeChartMasterId(e.target.value)}
                >
                  <option value="">-- None (Use Category Size Chart Master if available) --</option>
                  {sizeChartOptions.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Size Chart Image Upload (optional) - Overrides category image</label>`;

content = content.replace(oldUI, newUI);

fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', content);
console.log('Successfully updated AdminProductForm.tsx');
