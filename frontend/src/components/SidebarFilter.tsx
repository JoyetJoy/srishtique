import { useState } from 'react';
import './SidebarFilter.css';

interface SidebarFilterProps {
  filters: {
    categories: string[];
    occasions: string[];
    sizes: string[];
    colors: string[];
    types: string[];
    priceRange: [number, number];
  };
  onFilterChange: (filters: any) => void;
  showCategoryFilter: boolean;
  availableFilters: {
    categories: { slug: string; name: string }[];
    occasions: { slug: string; name: string }[];
    sizes: string[];
    colors: string[];
    types: string[];
    priceRange: [number, number];
  };
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const SidebarFilter = ({
  filters,
  onFilterChange,
  showCategoryFilter,
  availableFilters,
  searchQuery,
  onSearchChange
}: SidebarFilterProps) => {
  const [openSection, setOpenSection] = useState<string | null>('Price Range');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleCheckboxChange = (field: 'categories' | 'occasions' | 'sizes' | 'colors' | 'types', value: string) => {
    const currentList = filters[field];
    const newList = currentList.includes(value)
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    
    onFilterChange({
      ...filters,
      [field]: newList
    });
  };

  const handlePriceChange = (index: 0 | 1, value: string) => {
    const numValue = value === '' ? (index === 0 ? availableFilters.priceRange[0] : availableFilters.priceRange[1]) : Number(value);
    const newPriceRange = [...filters.priceRange] as [number, number];
    newPriceRange[index] = numValue;
    onFilterChange({
      ...filters,
      priceRange: newPriceRange
    });
  };

  const handleClearAll = () => {
    onFilterChange({
      categories: [],
      occasions: [],
      sizes: [],
      colors: [],
      types: [],
      priceRange: [availableFilters.priceRange[0], availableFilters.priceRange[1]]
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.occasions.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.types.length > 0 ||
    filters.priceRange[0] !== availableFilters.priceRange[0] ||
    filters.priceRange[1] !== availableFilters.priceRange[1];

  return (
    <aside className="sidebar-filter">
      <div className="sidebar-search">
        <div className="sidebar-search-input-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => onSearchChange('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="filter-header" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
          </svg>
          <span>FILTERS</span>
        </div>
        {hasActiveFilters && (
          <button 
            onClick={handleClearAll} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--maroon)', 
              fontSize: '12px', 
              fontWeight: 600, 
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="filter-sections">
        {/* Categories (only if showCategoryFilter is true) */}
        {showCategoryFilter && availableFilters.categories.length > 0 && (
          <div className="filter-section">
            <button 
              className="filter-section-header" 
              onClick={() => toggleSection('categories')}
            >
              <span>Categories</span>
              <svg className={`chevron ${openSection === 'categories' ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            
            {openSection === 'categories' && (
              <div className="filter-section-content">
                {availableFilters.categories.map((cat) => (
                  <label key={cat.slug} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={filters.categories.includes(cat.slug)}
                      onChange={() => handleCheckboxChange('categories', cat.slug)}
                    />
                    <span className="checkbox-text">{cat.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product Type */}
        {availableFilters.types.length > 0 && (
          <div className="filter-section">
            <button 
              className="filter-section-header" 
              onClick={() => toggleSection('types')}
            >
              <span>Product Type</span>
              <svg className={`chevron ${openSection === 'types' ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            
            {openSection === 'types' && (
              <div className="filter-section-content">
                {availableFilters.types.map((type) => (
                  <label key={type} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={filters.types.includes(type)}
                      onChange={() => handleCheckboxChange('types', type)}
                    />
                    <span className="checkbox-text">{type === 'CLOTHING' ? 'Clothing' : 'Ornament'}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price Range */}
        <div className="filter-section">
          <button 
            className="filter-section-header" 
            onClick={() => toggleSection('Price Range')}
          >
            <span>Price Range</span>
            <svg className={`chevron ${openSection === 'Price Range' ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          
          {openSection === 'Price Range' && (
            <div className="filter-section-content">
              <div className="price-inputs">
                <div className="price-input-wrapper">
                  <span className="rupee-symbol">₹</span>
                  <input 
                    type="number" 
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange(0, e.target.value)}
                    placeholder={String(availableFilters.priceRange[0])}
                  />
                </div>
                <div className="price-input-wrapper">
                  <span className="rupee-symbol">₹</span>
                  <input 
                    type="number" 
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(1, e.target.value)}
                    placeholder={String(availableFilters.priceRange[1])}
                  />
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                Range: ₹{availableFilters.priceRange[0]} - ₹{availableFilters.priceRange[1]}
              </div>
            </div>
          )}
        </div>

        {/* Sizes */}
        {availableFilters.sizes.length > 0 && (
          <div className="filter-section">
            <button 
              className="filter-section-header" 
              onClick={() => toggleSection('size')}
            >
              <span>Sizes</span>
              <svg className={`chevron ${openSection === 'size' ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            
            {openSection === 'size' && (
              <div className="filter-section-content">
                {availableFilters.sizes.map((size) => (
                  <label key={size} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={filters.sizes.includes(size)}
                      onChange={() => handleCheckboxChange('sizes', size)}
                    />
                    <span className="checkbox-text">{size}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Occasions */}
        {availableFilters.occasions.length > 0 && (
          <div className="filter-section">
            <button 
              className="filter-section-header" 
              onClick={() => toggleSection('occasions')}
            >
              <span>Occasions</span>
              <svg className={`chevron ${openSection === 'occasions' ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            
            {openSection === 'occasions' && (
              <div className="filter-section-content">
                {availableFilters.occasions.map((occ) => (
                  <label key={occ.slug} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={filters.occasions.includes(occ.slug)}
                      onChange={() => handleCheckboxChange('occasions', occ.slug)}
                    />
                    <span className="checkbox-text">{occ.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Colors */}
        {availableFilters.colors.length > 0 && (
          <div className="filter-section">
            <button 
              className="filter-section-header" 
              onClick={() => toggleSection('colors')}
            >
              <span>Colors</span>
              <svg className={`chevron ${openSection === 'colors' ? 'open' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            
            {openSection === 'colors' && (
              <div className="filter-section-content">
                {availableFilters.colors.map((color) => (
                  <label key={color} className="checkbox-label">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={filters.colors.includes(color)}
                      onChange={() => handleCheckboxChange('colors', color)}
                    />
                    <span className="checkbox-text">{color}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarFilter;
