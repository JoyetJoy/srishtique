import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';
import './InstagramSection.css';

interface InstagramSectionProps {
  products: any[];
}

const InstagramSection = ({ products }: InstagramSectionProps) => {
  const [customImages, setCustomImages] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/settings/INSTAGRAM_MOMENTS`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length === 5) {
              setCustomImages(parsed);
            }
          } catch (e) {
            console.error('Failed to parse INSTAGRAM_MOMENTS', e);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Fallback images in case products don't have enough images
  const fallbackImages = [
    '/images/hero-1.jpg',
    '/images/hero-2.jpg',
    '/images/hero-3.jpg',
    '/images/hero-4.jpg',
    '/images/hero-5.jpg'
  ];

  const productImages = products
    .filter(p => p.image)
    .map(p => getImageUrl(p.image));

  // Ensure we always have exactly 5 images for the layout
  // Priority: 1. Admin Custom Images 2. Product Images 3. Fallbacks
  const finalImages = Array(5).fill('').map((_, i) => {
    if (customImages[i] && customImages[i] !== '') return getImageUrl(customImages[i]);
    return productImages[i] || fallbackImages[i % fallbackImages.length];
  });

  return (
    <section className="instagram-section">
      <div className="instagram-container">
        <h2 className="instagram-title">From Our Community</h2>
        
        <div className="instagram-grid">
          <div className="instagram-col-small">
            <div className="instagram-img-wrapper">
              <img src={finalImages[0]} alt="Instagram Moment 1" loading="lazy" />
            </div>
            <div className="instagram-img-wrapper">
              <img src={finalImages[1]} alt="Instagram Moment 2" loading="lazy" />
            </div>
          </div>
          
          <div className="instagram-col-large">
            <div className="instagram-img-wrapper large">
              <img src={finalImages[2]} alt="Instagram Moment 3" loading="lazy" />
            </div>
          </div>
          
          <div className="instagram-col-small">
            <div className="instagram-img-wrapper">
              <img src={finalImages[3]} alt="Instagram Moment 4" loading="lazy" />
            </div>
            <div className="instagram-img-wrapper">
              <img src={finalImages[4]} alt="Instagram Moment 5" loading="lazy" />
            </div>
          </div>
        </div>
        
        <div className="instagram-footer">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="instagram-btn">
            FOLLOW US ON INSTAGRAM
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
