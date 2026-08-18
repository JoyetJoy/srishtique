import { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SidebarFilter from '../components/SidebarFilter';
import { ProductCard } from '../components/ProductSection';
import Loader from '../components/Loader';
import CategorySection from '../components/CategorySection';
import SEO from '../components/SEO';
import { getImageUrl } from '../utils/imageUrl';
import './ProductListingPage.css';

const ProductListingPage = () => {
  const { slug, id } = useParams();
  const location = useLocation();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [staticSeo, setStaticSeo] = useState({ title: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 10;

  const [filters, setFilters] = useState({
    categories: [] as string[],
    occasions: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    types: [] as string[],
    priceRange: [0, 5000] as [number, number]
  });

  const [priceRangeSet, setPriceRangeSet] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [location.pathname, filters, allProducts]);

  // 1. Scroll to top and fetch data
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    const productsPromise = fetch(`${import.meta.env.VITE_API_URL}/api/public/products`)
      .then(res => res.json())
      .catch(err => console.error('Failed to fetch products', err));

    const categoriesPromise = fetch(`${import.meta.env.VITE_API_URL}/api/public/categories`)
      .then(res => res.json())
      .catch(err => console.error('Failed to fetch categories', err));

    const occasionsPromise = fetch(`${import.meta.env.VITE_API_URL}/api/public/occasions`)
      .then(res => res.json())
      .catch(err => console.error('Failed to fetch occasions', err));

    Promise.all([productsPromise, categoriesPromise, occasionsPromise]).then(
      ([productsData, categoriesData, occasionsData]) => {
        if (productsData) setAllProducts(productsData);
        if (categoriesData) setCategories(categoriesData);
        if (occasionsData) setOccasions(occasionsData);
        setLoading(false);
      }
    );
  }, []);

  // 2. Parse current page type and details based on location path
  const pageDetails = useMemo(() => {
    const path = location.pathname;
    
    if (path.startsWith('/category/')) {
      const cat = categories.find(c => c.slug === slug);
      return {
        type: 'category',
        title: cat ? cat.name : slug ? slug.replace(/-/g, ' ').toUpperCase() : 'CATEGORY',
        showCategoryFilter: false
      };
    }
    
    if (path.startsWith('/occasion/')) {
      const occ = occasions.find(o => o.slug === slug);
      return {
        type: 'occasion',
        title: occ ? occ.name : slug ? slug.replace(/-/g, ' ').toUpperCase() : 'OCCASION',
        showCategoryFilter: true,
        heroImage: occ?.heroImage
      };
    }

    if (path === '/maternity') {
      const occ = occasions.find(o => o.slug === 'maternity');
      return {
        type: 'maternity',
        title: occ ? occ.name : 'MATERNITY WEAR',
        showCategoryFilter: true,
        heroImage: occ?.heroImage
      };
    }

    if (path.startsWith('/new-arrivals')) {
      return {
        type: 'new-arrivals',
        title: 'NEW ARRIVALS',
        showCategoryFilter: true
      };
    }

    if (path.startsWith('/trending')) {
      return {
        type: 'trending',
        title: 'TRENDING NOW',
        showCategoryFilter: true
      };
    }

    if (path.startsWith('/collection/')) {
      return {
        type: 'collection',
        title: 'COLLECTION',
        showCategoryFilter: true
      };
    }

    if (path === '/clothes') {
      return {
        type: 'clothes',
        title: 'CLOTHING',
        showCategoryFilter: true,
        defaultTypeFilter: 'CLOTHING'
      };
    }

    if (path === '/products') {
      return {
        type: 'products',
        title: 'PRODUCTS',
        showCategoryFilter: true
      };
    }

    if (path === '/search') {
      return {
        type: 'search',
        title: 'SEARCH RESULTS',
        showCategoryFilter: true
      };
    }

    return {
      type: 'all',
      title: 'ALL PRODUCTS',
      showCategoryFilter: true
    };
  }, [location.pathname, slug, categories, occasions]);

  // Fetch static SEO settings
  useEffect(() => {
    const fetchStaticSeo = async () => {
      let key = '';
      if (pageDetails.type === 'clothes') key = 'SEO_CLOTHES';
      else if (pageDetails.type === 'products') key = 'SEO_ORNAMENTS';
      else if (pageDetails.type === 'trending') key = 'SEO_TRENDING';
      else if (pageDetails.type === 'new-arrivals') key = 'SEO_NEW_ARRIVALS';

      if (key) {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/${key}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.value) {
              const parsed = JSON.parse(data.value);
              setStaticSeo({ title: parsed.title || '', description: parsed.description || '' });
              return;
            }
          }
        } catch (e) {
          console.error('Failed to fetch SEO for', key, e);
        }
      }
      setStaticSeo({ title: '', description: '' });
    };

    fetchStaticSeo();
  }, [pageDetails.type]);

  const seoTitle = useMemo(() => {
    if (pageDetails.type === 'category') {
      const cat = categories.find(c => c.slug === slug);
      return cat?.metaTitle || cat?.name || pageDetails.title;
    }
    if (pageDetails.type === 'occasion') {
      const occ = occasions.find(o => o.slug === slug);
      return occ?.metaTitle || occ?.name || pageDetails.title;
    }
    return staticSeo.title || pageDetails.title;
  }, [pageDetails, categories, occasions, slug, staticSeo]);

  const seoDescription = useMemo(() => {
    if (pageDetails.type === 'category') {
      const cat = categories.find(c => c.slug === slug);
      return cat?.metaDescription || undefined;
    }
    if (pageDetails.type === 'occasion') {
      const occ = occasions.find(o => o.slug === slug);
      return occ?.metaDescription || undefined;
    }
    return staticSeo.description || undefined;
  }, [pageDetails, categories, occasions, slug, staticSeo]);

  // 3. Format raw database products (extract min variant price & originalPrice)
  const formattedProducts = useMemo(() => {
    if (!Array.isArray(allProducts)) return [];
    return allProducts.map((p: any) => {
      const prices = p.variants?.map((v: any) => v.price) || [];
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const minVariant = p.variants?.find((v: any) => v.price === minPrice) || p.variants?.[0];
      return {
        ...p,
        price: minPrice,
        originalPrice: minVariant?.originalPrice,
        variantId: minVariant?.id,
        size: minVariant?.size,
        color: minVariant?.color,
        image: p.images?.[0] || '',
        isOutOfStock: !p.variants || p.variants.length === 0 || p.variants.every((v: any) => v.stock <= 0)
      };
    });
  }, [allProducts]);

  // 4. Calculate available filters dynamically based on fetched products
  const availableFilters = useMemo(() => {
    const catsMap = new Map<string, string>();
    const occsMap = new Map<string, string>();
    const sizesSet = new Set<string>();
    const colorsSet = new Set<string>();
    const typesSet = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    formattedProducts.forEach((p: any) => {
      // Categories
      if (p.category) {
        catsMap.set(p.category.slug, p.category.name);
      }
      // Occasions
      if (p.occasion) {
        occsMap.set(p.occasion.slug, p.occasion.name);
      }
      // Types
      if (p.type) {
        typesSet.add(p.type);
      }
      // Variants
      p.variants?.forEach((v: any) => {
        if (v.size) sizesSet.add(v.size);
        if (v.color) colorsSet.add(v.color);
        if (v.price < minPrice) minPrice = v.price;
        if (v.price > maxPrice) maxPrice = v.price;
      });
    });

    const categoriesList = Array.from(catsMap.entries()).map(([slug, name]) => ({ slug, name }));
    const occasionsList = Array.from(occsMap.entries()).map(([slug, name]) => ({ slug, name }));
    const sizes = Array.from(sizesSet).sort();
    const colors = Array.from(colorsSet).sort();
    const types = Array.from(typesSet).sort();

    return {
      categories: categoriesList,
      occasions: occasionsList,
      sizes,
      colors,
      types,
      priceRange: [
        minPrice === Infinity ? 0 : minPrice,
        maxPrice === -Infinity ? 5000 : maxPrice
      ] as [number, number]
    };
  }, [formattedProducts]);

  // 5. Update default price range once availableFilters are computed
  useEffect(() => {
    if (!priceRangeSet && formattedProducts.length > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [...availableFilters.priceRange]
      }));
      setPriceRangeSet(true);
    }
  }, [availableFilters, formattedProducts, priceRangeSet]);

  // 6. Reset filters when location path changes
  useEffect(() => {
    setFilters({
      categories: [],
      occasions: [],
      sizes: [],
      colors: [],
      types: (pageDetails as any).defaultTypeFilter ? [(pageDetails as any).defaultTypeFilter] : [],
      priceRange: [...availableFilters.priceRange]
    });
    setPriceRangeSet(false);
    setSearchQuery('');
  }, [location.pathname]);

  // 7. Apply filtering logic
  const filteredProducts = useMemo(() => {
    return formattedProducts.filter((product: any) => {
      // Filter by page type
      if (pageDetails.type === 'category') {
        if (product.category?.slug !== slug) return false;
      } else if (pageDetails.type === 'occasion') {
        if (!product.occasions?.some((o: any) => o.slug === slug)) return false;
      } else if (pageDetails.type === 'maternity') {
        if (!product.occasions?.some((o: any) => o.slug === 'maternity')) return false;
      } else if (pageDetails.type === 'new-arrivals') {
        if (!product.isNewArrival) return false;
      } else if (pageDetails.type === 'trending') {
        if (!product.isTrending) return false;
      } else if (pageDetails.type === 'collection') {
        if (String(product.categoryId) !== id && !product.occasions?.some((o: any) => String(o.id) === id)) return false;
      }

      if (searchQuery.trim() !== '') {
        if (!product.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
          return false;
        }
      }

      // Filter by selected sidebar filters
      if (pageDetails.showCategoryFilter && filters.categories.length > 0) {
        if (!product.category || !filters.categories.includes(product.category.slug)) {
          return false;
        }
      }

      if (filters.occasions.length > 0) {
        if (!product.occasions || !product.occasions.some((o: any) => filters.occasions.includes(o.slug))) {
          return false;
        }
      }

      if (filters.types.length > 0) {
        if (!filters.types.includes(product.type)) {
          return false;
        }
      }

      if (filters.sizes.length > 0) {
        const hasSize = product.variants?.some((v: any) => filters.sizes.includes(v.size));
        if (!hasSize) return false;
      }

      if (filters.colors.length > 0) {
        const hasColor = product.variants?.some((v: any) => filters.colors.includes(v.color));
        if (!hasColor) return false;
      }

      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [formattedProducts, pageDetails, slug, id, filters, searchQuery]);

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      occasions: [],
      sizes: [],
      colors: [],
      types: [],
      priceRange: [...availableFilters.priceRange]
    });
  };

  return (
    <>
      <SEO title={seoTitle} description={seoDescription} />
      {(pageDetails.type === 'clothes' || pageDetails.type === 'category' || pageDetails.type === 'collection' || pageDetails.type === 'new-arrivals' || pageDetails.type === 'trending' || pageDetails.type === 'products') && (
        <CategorySection 
          key={pageDetails.type}
          defaultTab="SPICE"
          activeCategorySlug={slug} 
        />
      )}
      {(pageDetails.type === 'occasion' || pageDetails.type === 'maternity') && pageDetails.heroImage && (
        <div style={{ width: '100%', marginBottom: '0' }}>
          <img src={getImageUrl(pageDetails.heroImage)} alt={pageDetails.title} style={{ width: '100%', height: '350px', display: 'block', objectFit: 'cover', objectPosition: 'center 20%' }} />
        </div>
      )}
      <div className="plp-page">
        <div className="container">
          <div className="plp-layout">

          <div className={`plp-sidebar ${isFilterOpen ? 'open' : ''}`}>
            <SidebarFilter 
              filters={filters}
              onFilterChange={setFilters}
              showCategoryFilter={pageDetails.showCategoryFilter}
              availableFilters={availableFilters}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className="plp-main">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h1 className="plp-title" style={{ margin: 0 }}>{pageDetails.title}</h1>
                <button 
                  className="mobile-filter-toggle" 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  {isFilterOpen ? 'HIDE FILTERS' : 'FILTERS'}
                </button>
              </div>
              {!loading && (
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <Loader />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>No products found</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Try clearing some filters or narrowing down your search.</p>
                <button 
                  onClick={handleClearFilters}
                  style={{ background: 'var(--maroon)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#6b1124')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'var(--maroon)')}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="plp-grid">
                  {filteredProducts.slice((currentPage - 1) * limit, currentPage * limit).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {filteredProducts.length > limit && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px', paddingBottom: '20px' }}>
                    <button 
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', borderRadius: '6px', color: currentPage === 1 ? '#94a3b8' : '#0f172a' }}
                    >
                      Previous
                    </button>
                    <span style={{ fontSize: '14px', color: '#475569', margin: '0 8px' }}>
                      Page {currentPage} of {Math.ceil(filteredProducts.length / limit)}
                    </span>
                    <button 
                      onClick={() => {
                        setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / limit)));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === Math.ceil(filteredProducts.length / limit)}
                      style={{ padding: '8px 12px', border: '1px solid #e2e8f0', background: currentPage === Math.ceil(filteredProducts.length / limit) ? '#f8fafc' : 'white', cursor: currentPage === Math.ceil(filteredProducts.length / limit) ? 'not-allowed' : 'pointer', borderRadius: '6px', color: currentPage === Math.ceil(filteredProducts.length / limit) ? '#94a3b8' : '#0f172a' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

        </div>
      </div>
      
      {/* Keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    </>
  );
};

export default ProductListingPage;
