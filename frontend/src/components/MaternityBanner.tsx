import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import './MaternityBanner.css';

export interface OccasionSlideData {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
}

const defaultSlides: OccasionSlideData[] = [];

const MaternityBanner = () => {
  const [slides, setSlides] = useState<OccasionSlideData[]>(defaultSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStart = useRef<number>(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/settings/OCCASION_SLIDES`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(parsed);
            }
          } catch(e) {
            console.error('Failed to parse OCCASION_SLIDES');
          }
        }
      })
      .catch(() => {});
  }, []);

  const goToSlide = useCallback((index: number, dir: 'next' | 'prev') => {
    if (isAnimating || index === activeIndex) return;
    setIsAnimating(true);
    setDirection(dir);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  }, [activeIndex, isAnimating]);

  const nextSlide = useCallback(() => {
    goToSlide((activeIndex + 1) % slides.length, 'next');
  }, [activeIndex, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((activeIndex - 1 + slides.length) % slides.length, 'prev');
  }, [activeIndex, slides.length, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
  };

  const activeSlide = slides[activeIndex] || slides[0];
  const formattedTitle = (activeSlide?.title || '').replace(/\\n/g, '\n');

  if (slides.length === 0) return null;

  return (
    <section className="maternity-section">
      <div
        className="maternity-slider"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="maternity-track" style={{ '--total': slides.length } as React.CSSProperties}>
          {slides.map((slide, index) => {
            const offset = index - activeIndex;
            return (
              <div
                key={index}
                className={`maternity-slide ${index === activeIndex ? 'active' : ''}`}
                style={{
                  '--offset': offset,
                  '--direction': direction === 'next' ? 1 : -1,
                } as React.CSSProperties}
              >
                <img
                  src={getImageUrl(slide.imageUrl)}
                  alt={`Occasion Banner ${index + 1}`}
                  className="maternity-full-img"
                />
                <div className="maternity-overlay" />
              </div>
            );
          })}
        </div>

        {/* Text Content Overlay */}
        <div className="maternity-content">
          <h2 className="maternity-title">
            {formattedTitle.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="maternity-description">{activeSlide?.description}</p>
          <Link to={activeSlide?.linkUrl || '#'} className="maternity-cta">
            {activeSlide?.linkText}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {slides.length > 1 && (
          <>
            <div className="maternity-dots">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`maternity-dot ${index === activeIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index, index > activeIndex ? 'next' : 'prev')}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button className="maternity-nav maternity-nav-prev" onClick={prevSlide} aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="maternity-nav maternity-nav-next" onClick={nextSlide} aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default MaternityBanner;
