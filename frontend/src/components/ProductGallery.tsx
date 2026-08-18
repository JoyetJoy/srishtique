import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';

const ProductGallery = ({ images = [], initialActiveIndex = 0 }: { images?: string[], initialActiveIndex?: number }) => {
  const [activeThumb, setActiveThumb] = useState(initialActiveIndex);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');

  useEffect(() => {
    setActiveThumb(initialActiveIndex);
  }, [initialActiveIndex, images]);

  if (!images || images.length === 0) return <div className="product-gallery"><p>No images</p></div>;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="product-gallery">
      <div className="gallery-thumbnails">
        {images.map((img, index) => (
          <div 
            key={index}
            className={`gallery-thumb ${activeThumb === index ? 'active' : ''}`}
            onClick={() => setActiveThumb(index)}
          >
            <img src={getImageUrl(img)} alt={`Thumbnail ${index + 1}`} />
          </div>
        ))}
      </div>
      <div 
        className="gallery-main"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <img 
          src={getImageUrl(images[activeThumb])} 
          alt="Main product" 
          style={isZooming ? { transformOrigin: zoomOrigin, transform: 'scale(2.5)' } : { transformOrigin: '50% 50%', transform: 'scale(1)' }}
        />
      </div>
    </div>
  );
};

export default ProductGallery;
