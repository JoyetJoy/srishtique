import { useState, useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUrl';
import toast from 'react-hot-toast';
import './QuickAddDrawer.css';

interface QuickAddDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number | null;
}

const colorHexMap: { [key: string]: string } = {
  green: '#2e7d32',
  red: '#c62828',
  blue: '#1565c0',
  black: '#212121',
  white: '#ffffff',
  yellow: '#fbc02d',
  pink: '#e91e63',
  purple: '#6a1b9a',
  orange: '#ef6c00',
  brown: '#4e342e',
  maroon: '#800000',
  navy: '#000080',
  grey: '#9e9e9e',
  beige: '#f5f5dc',
  multi: 'linear-gradient(45deg, red, blue, green, yellow)'
};

const QuickAddDrawer = ({ isOpen, onClose, productId }: QuickAddDrawerProps) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeSize, setActiveSize] = useState('M');
  const [activeColorName, setActiveColorName] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}/api/public/products`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const found = data.find((p: any) => p.id === productId);
            if (found) {
              setProduct(found);
              // Set defaults based on variants
              if (found.variants && found.variants.length > 0) {
                const sizes = Array.from(new Set(found.variants.map((v: any) => v.size)));
                const colors = Array.from(new Set(found.variants.map((v: any) => v.color)));
                if (sizes.length > 0) setActiveSize(sizes[0] as string);
                if (colors.length > 0) setActiveColorName(colors[0] as string);
              }
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  const availableColors = product?.variants 
    ? Array.from(new Set(product.variants.map((v: any) => v.color))) as string[]
    : ['maroon', 'green', 'black', 'white'];

  const colors = availableColors.map(colorName => ({
    name: colorName,
    hex: colorHexMap[colorName.toLowerCase()] || colorName
  }));

  const sizes = product?.variants 
    ? Array.from(new Set(product.variants.map((v: any) => v.size))) as string[]
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const matchingVariant = product?.variants?.find(
    (v: any) => v.size === activeSize && v.color === activeColorName
  ) || product?.variants?.[0];

  const handleAddToCart = () => {
    if (!matchingVariant && product?.variants?.length > 0) {
      toast.error('This variant is currently out of stock');
      return;
    }
    addToCart(
      product, 
      activeSize, 
      activeColorName || matchingVariant?.color || 'Default', 
      quantity, 
      matchingVariant?.id || 0, 
      matchingVariant?.price, 
      matchingVariant?.originalPrice
    );
    toast.success(`${product.name} added to cart!`);
    onClose();
  };

  // Determine correct image
  let displayImage = product?.images?.[0] || '';
  if (matchingVariant && matchingVariant.images) {
    let parsed = matchingVariant.images;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch(e){}
    }
    if (Array.isArray(parsed) && parsed.length > 0) {
      displayImage = parsed[0];
    }
  }

  return (
    <>
      <div className="quick-add-overlay" onClick={onClose} />
      <div className={`quick-add-drawer ${isOpen ? 'open' : ''}`}>
        <div className="quick-add-header">
          <h3>Quick Add</h3>
          <button onClick={onClose} className="close-quick-add"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="quick-add-loading">Loading details...</div>
        ) : product ? (
          <div className="quick-add-content">
            <div className="quick-add-product-info">
              <div className="quick-img-container">
                <img src={getImageUrl(displayImage)} alt={product.name} />
              </div>
              <div className="quick-details">
                <h4>{product.name}</h4>
                <div className="quick-price-row">
                  <span className="quick-price">₹{matchingVariant?.price || product.price || 0}</span>
                  {(matchingVariant?.originalPrice || product.originalPrice) && (
                    <span className="quick-original-price">₹{matchingVariant?.originalPrice || product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>

            {colors.length > 0 && colors[0].name && (
              <div className="quick-options-section">
                <span className="quick-option-label">Color: <strong>{activeColorName}</strong></span>
                <div className="quick-color-options">
                  {colors.map((color, index) => (
                    <button 
                      key={index}
                      className={`quick-color-btn ${activeColorName === color.name ? 'active' : ''}`}
                      style={{ background: color.hex }}
                      onClick={() => setActiveColorName(color.name)}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="quick-options-section">
              <span className="quick-option-label">Size: <strong>{activeSize}</strong></span>
              <div className="quick-size-options">
                {sizes.map(size => (
                  <button 
                    key={size}
                    className={`quick-size-btn ${activeSize === size ? 'active' : ''}`}
                    onClick={() => setActiveSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="quick-options-section">
              <span className="quick-option-label">Quantity</span>
              <div className="quick-qty-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="quick-add-loading">Product not found.</div>
        )}

        <div className="quick-add-footer">
          <button 
            className="quick-add-submit" 
            onClick={handleAddToCart}
            disabled={loading || !product}
          >
            <ShoppingCart size={18} /> Add to Cart
          </button>
        </div>
      </div>
    </>
  );
};

export default QuickAddDrawer;
