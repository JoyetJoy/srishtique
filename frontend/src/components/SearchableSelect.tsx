import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const SearchableSelect = ({ options, value, onChange, placeholder = 'Select...', required }: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find(o => String(o.value) === String(value))?.label || '';

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => { setIsOpen(!isOpen); setTimeout(() => inputRef.current?.focus(), 0); }}
        style={{
          padding: '10px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          color: selectedLabel ? '#0f172a' : '#94a3b8',
          minHeight: '42px',
        }}
      >
        {/* Hidden input for form validation */}
        <input 
          type="hidden" 
          name="searchable-select" 
          value={value} 
          required={required} 
        />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel || placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ flexShrink: 0, marginLeft: 8, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          marginTop: '4px',
          zIndex: 100,
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          maxHeight: '200px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '150px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '8px 12px', color: '#94a3b8', fontSize: '13px' }}>No results found</div>
            ) : (
              filtered.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(String(opt.value))}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    background: String(opt.value) === String(value) ? '#fdf2f8' : 'transparent',
                    color: String(opt.value) === String(value) ? '#80011f' : '#0f172a',
                    fontWeight: String(opt.value) === String(value) ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (String(opt.value) !== String(value)) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (String(opt.value) !== String(value)) e.currentTarget.style.background = 'transparent'; }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
