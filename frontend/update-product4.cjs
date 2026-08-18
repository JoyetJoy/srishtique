const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminProductForm.tsx', 'utf8');

const sizeChartJSX = `              <div className="admin-form-group">
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
              </div>\n`;

content = content.replace(
  "              <div className=\"admin-form-group\">\n                <label>Category</label>",
  sizeChartJSX + "              <div className=\"admin-form-group\">\n                <label>Category</label>"
);

if (content.indexOf("Size Chart Upload") === -1) {
  content = content.replace(
    "              <div className=\"admin-form-group\">\r\n                <label>Category</label>",
    sizeChartJSX.replace(/\n/g, '\r\n') + "              <div className=\"admin-form-group\">\r\n                <label>Category</label>"
  );
}

fs.writeFileSync('src/pages/admin/AdminProductForm.tsx', content);
