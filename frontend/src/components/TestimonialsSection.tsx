import { useState, useEffect, useRef } from 'react';
import './TestimonialsSection.css';

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/public/testimonials`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(err => console.error('Failed to fetch testimonials', err));
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -340 : 340,
        behavior: 'smooth'
      });
    }
  };

  if (reviews.length === 0) return null;

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <h2 className="testimonials-heading">HEAR FROM OUR CUSTOMERS</h2>

        <div className="testimonials-carousel-wrap">
          <button className="carousel-arrow carousel-arrow-left" onClick={() => scroll('left')} aria-label="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <div className="testimonials-carousel" ref={scrollRef}>
            {reviews.map(r => (
              <div key={r.id} className="testimonial-card">
                <div className="testimonial-quote">❝</div>
                <div className="testimonial-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`star ${i < r.rating ? 'filled' : ''}`}>★</span>
                  ))}
                </div>
                <p className="testimonial-text">{r.text}</p>
                <div className="testimonial-divider" />
                <p className="testimonial-name">{r.name}</p>
              </div>
            ))}
          </div>

          <button className="carousel-arrow carousel-arrow-right" onClick={() => scroll('right')} aria-label="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
