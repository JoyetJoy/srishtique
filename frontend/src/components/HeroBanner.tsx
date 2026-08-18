import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';
import { Link } from 'react-router-dom';
import OrnamentDivider from './OrnamentDivider';
import './HeroBanner.css';

export interface HeroSlideData {
  id: string;
  imageUrl: string;
  subtitle: string;
  title: string;
  description: string;
  button1Text: string;
  button1Url: string;
  button2Text: string;
  button2Url: string;
}

const HeroBanner = () => {
  const [slides, setSlides] = useState<HeroSlideData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/settings/HERO_SLIDES`)
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
          } catch (e) {
            console.error('Failed to parse HERO_SLIDES', e);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Simple auto-play
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="hero-section">
      {slides.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
          style={{ opacity: index === currentSlide ? 1 : 0, transition: 'opacity 0.8s ease-in-out', position: index === currentSlide ? 'relative' : 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <img src={getImageUrl(slide.imageUrl)} alt={`Banner ${index + 1}`} className="hero-full-img" />
          
          {/* Dark gradient overlay on mobile to make text readable */}
          <div className="hero-mobile-overlay"></div>
          
          {/* Text Overlay */}
          <div className="hero-overlay-container container">
            <div className="hero-text-content">
              {slide.subtitle && <p className="hero-subtitle">{slide.subtitle}</p>}
              {slide.title && <h1 className="hero-title">{slide.title}</h1>}
              
              <OrnamentDivider />
              
              {slide.description && <p className="hero-description">{slide.description}</p>}
              
              <div className="hero-buttons">
                {slide.button1Text && slide.button1Url && (
                  <Link to={slide.button1Url} className="hero-btn primary-btn">
                    {slide.button1Text}
                  </Link>
                )}
                {slide.button2Text && slide.button2Url && (
                  <Link to={slide.button2Url} className="hero-btn secondary-btn">
                    {slide.button2Text}
                  </Link>
                )}
              </div>

              {/* Numbered Pagination */}
              <div className="hero-pagination-inline">
                {slides.map((_, index) => {
                  const number = (index + 1).toString().padStart(2, '0');
                  return (
                    <button
                      key={index}
                      className={`hero-page-num ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default HeroBanner;
