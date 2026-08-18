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

  // Auto-scroll animation
  useEffect(() => {
    if (reviews.length <= 1) return;
    
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
           scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
           scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000);
    
    return () => clearInterval(interval);
  }, [reviews]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="testimonials-section">
      <div className="container testimonials-split-container">
        <div className="testimonials-left">
          <div className="quote-mark quote-left">“</div>
          <h2 className="testimonials-heading">Happy Customers<br/>Review</h2>
          <p className="testimonials-subheading">Real experiences, real smiles</p>
        </div>
        
        <div className="testimonials-right">
          <div className="testimonials-carousel-wrap">
            <div className="testimonials-carousel" ref={scrollRef}>
              {reviews.map(r => (
                <div key={r.id} className="testimonial-card">
                  <div className="testimonial-author">
                    <p className="testimonial-name">{r.name}</p>
                  </div>
                  <div className="testimonial-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={`star ${i < r.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                  <p className="testimonial-text">{r.text}</p>
                </div>
              ))}
            </div>

            <button className="carousel-arrow carousel-arrow-right" onClick={() => scroll('right')} aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
          <div className="quote-mark quote-right">“</div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
