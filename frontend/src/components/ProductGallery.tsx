import { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUrl';

const ProductGallery = ({ images = [], initialActiveIndex = 0 }: { images?: string[], initialActiveIndex?: number }) => {
  const [activeThumb, setActiveThumb] = useState(initialActiveIndex);

  useEffect(() => {
    setActiveThumb(initialActiveIndex);
  }, [initialActiveIndex, images]);

  if (!images || images.length === 0) return <div className="product-gallery"><p>No images</p></div>;

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
      <div className="gallery-main">
        <img 
          src={getImageUrl(images[activeThumb])} 
          alt="Main product" 
        />
      </div>
    </div>
  );
};

export default ProductGallery;
