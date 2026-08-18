const OrnamentDivider = () => (
  <div className="ornament-divider" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px auto', width: '100%', maxWidth: '150px' }}>
    <div style={{ flex: 1, height: '1px', background: 'var(--maroon)' }}></div>
    <div style={{ width: '6px', height: '6px', transform: 'rotate(45deg)', background: 'var(--maroon)', margin: '0 8px' }}></div>
    <div style={{ flex: 1, height: '1px', background: 'var(--maroon)' }}></div>
  </div>
);

export default OrnamentDivider;
