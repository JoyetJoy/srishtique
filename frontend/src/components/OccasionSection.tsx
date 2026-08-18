import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import OrnamentDivider from './OrnamentDivider';
import './OccasionSection.css';

const OccasionSection = () => {
  const [occasions, setOccasions] = useState<any[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/public/occasions`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setOccasions(data);
      })
      .catch(err => console.error('Failed to fetch occasions', err));
  }, []);

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
  }, [occasions]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="occasion-section">
      <div className="occasion-container">
        <div className="occasion-header">
          <h2 className="occasion-title">Export Quality for Every Market</h2>
          <p className="occasion-subtitle">Carefully sourced. Processed with care. Delivered worldwide.</p>
          <OrnamentDivider />
        </div>
        
        <div className="occasion-scroll-wrapper">
          {showLeftArrow && (
            <button className="occasion-arrow occasion-arrow-left" onClick={() => scroll('left')} aria-label="Scroll left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}
          
          <div className={`occasion-grid ${occasions.length < 5 ? 'centered' : ''}`} ref={scrollRef}>
            {occasions.map((occ, idx) => (
              <Link key={idx} to={`/occasion/${occ.slug}`} className="occasion-card">
                <div className="occasion-image-wrapper">
                  <img src={getImageUrl(occ.image)} alt={occ.name} loading="lazy" />
                </div>
                <div className="occasion-name-text">{occ.name}</div>
              </Link>
            ))}
          </div>

          {showRightArrow && (
            <button className="occasion-arrow occasion-arrow-right" onClick={() => scroll('right')} aria-label="Scroll right">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>
        
        <div className="occasion-explore-btn-wrapper">
          <Link to="/occasions" className="primary-btn" style={{ textDecoration: 'none' }}>
            EXPLORE MORE
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OccasionSection;
