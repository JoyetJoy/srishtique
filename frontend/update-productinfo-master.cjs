const fs = require('fs');
let content = fs.readFileSync('src/components/ProductInfo.tsx', 'utf8');

// Replace sizeChartUrl definition and add renderTabularSizeChart helper
const oldVariables = `  const sizeChartUrl = product?.sizeChart || product?.category?.sizeChart;`;

const newVariables = `  const sizeChartMaster = product?.sizeChartMaster || product?.category?.sizeChartMaster;
  const sizeChartUrl = product?.sizeChart || product?.category?.sizeChart;
  const hasSizeChart = !!(sizeChartMaster || sizeChartUrl);

  const renderTabularSizeChart = (masterData: any) => {
    let sections: any[] = [];
    try {
      sections = typeof masterData === 'string' ? JSON.parse(masterData) : masterData;
    } catch {
      sections = [];
    }
    if (!Array.isArray(sections) || sections.length === 0) return null;

    return (
      <div style={{ background: '#000', color: '#fff', padding: '16px', borderRadius: '8px', fontFamily: 'sans-serif', margin: '10px 0' }}>
        {sections.map((sec: any, idx: number) => (
          <div key={idx} style={{ marginBottom: idx < sections.length - 1 ? '20px' : '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '8px', marginBottom: '10px', fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>
              <span>{sec.title || 'SIZE CHART'}</span>
              {sec.headers.filter((h: string) => h.toLowerCase() !== 'size').map((h: string) => (
                <span key={h} style={{ minWidth: '45px', textAlign: 'center' }}>{h.toUpperCase()}</span>
              ))}
            </div>
            {sec.rows.map((row: any, rIdx: number) => (
              <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#ddd' }}>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>{row['Size'] || row['size'] || Object.values(row)[0]}</span>
                {sec.headers.filter((h: string) => h.toLowerCase() !== 'size').map((h: string) => (
                  <span key={h} style={{ minWidth: '45px', textAlign: 'center' }}>{row[h] || '-'}</span>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };`;

content = content.replace(oldVariables, newVariables);

// Replace accordions definition
const oldAccordionsBlock = `  const accordions = sizeChartUrl 
    ? [
        { 
          title: 'Size Chart', 
          content: (
            <div style={{ padding: '10px 0' }}>
              <img src={getImageUrl(sizeChartUrl)} alt="Size Chart" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
            </div>
          )
        },
        ...baseAccordions
      ]
    : baseAccordions;`;

const newAccordionsBlock = `  const sizeChartContent = (
    <div style={{ padding: '5px 0' }}>
      {sizeChartMaster && renderTabularSizeChart(sizeChartMaster.data)}
      {sizeChartUrl && (
        <div style={{ marginTop: sizeChartMaster ? '15px' : '0' }}>
          <img src={getImageUrl(sizeChartUrl)} alt="Size Chart" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
        </div>
      )}
    </div>
  );

  const accordions = hasSizeChart 
    ? [
        { 
          title: 'Size Chart', 
          content: sizeChartContent
        },
        ...baseAccordions
      ]
    : baseAccordions;`;

content = content.replace(oldAccordionsBlock, newAccordionsBlock);

fs.writeFileSync('src/components/ProductInfo.tsx', content);
console.log('Successfully updated ProductInfo.tsx');
