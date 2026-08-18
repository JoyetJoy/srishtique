import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import './CategorySection.css';

interface CategorySectionProps {
  defaultTab?: 'ORNAMENT';
  activeCategorySlug?: string;
  showAllOption?: boolean;
}

const CategorySection = ({ defaultTab = 'ORNAMENT', activeCategorySlug, showAllOption = false }: CategorySectionProps = {}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ORNAMENT'>(defaultTab);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/public/categories`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (activeCategorySlug) {
            const activeCat = data.find((c: any) => c.slug === activeCategorySlug);
            if (activeCat) {
              setActiveTab(activeCat.type);
            }
          }
        }
      })
      .catch(err => console.error('Failed to fetch categories', err));
  }, [activeCategorySlug]);

  const filteredCategories = categories.filter(cat => cat.type === activeTab);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    const timer = setTimeout(checkScroll, 100);
    
    const resizeObserver = new ResizeObserver(() => checkScroll());
    resizeObserver.observe(el);

    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [filteredCategories]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-header">
          <div className="category-title-block">
            <h2 className="category-title">
              Shop by Category
            </h2>
          </div>
        </div>
        <div className="category-scroll-wrapper">
          {showLeftArrow && (
            <button className="category-arrow category-arrow-left" onClick={() => scroll('left')} aria-label="Scroll left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}
          <div className="category-grid" ref={scrollRef}>
            {showAllOption && (
              <Link 
                to='/products' 
                className={`category-card ${!activeCategorySlug ? 'active' : ''}`}
              >
                <div className="category-image" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#64748b' }}>All</span>
                </div>
                <span className="category-name">All Categories</span>
              </Link>
            )}
            {filteredCategories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className={`category-card ${cat.slug === activeCategorySlug ? 'active' : ''}`}>
                <div className="category-image">
                  <img src={getImageUrl(cat.image)} alt={cat.name} />
                </div>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
          {showRightArrow && (
            <button className="category-arrow category-arrow-right" onClick={() => scroll('right')} aria-label="Scroll right">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
