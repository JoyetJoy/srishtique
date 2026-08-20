import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import CheckoutDrawer from './CheckoutDrawer';
import { getImageUrl } from '../utils/imageUrl';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const colorHexMap: { [key: string]: string } = {
  green: '#2e7d32',
  red: '#c62828',
  blue: '#1565c0',
  yellow: '#fbc02d',
  white: '#ffffff',
  black: '#000000',
  teal: '#008080',
  maroon: '#582c36',
  lime: '#c0ca33',
  pink: '#e91e63'
};

const ProductInfo = ({ product, onColorChange }: { product: any, onColorChange?: (color: string) => void }) => {
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);
  const [notifySubscribed, setNotifySubscribed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const availableColors = product?.variants 
    ? Array.from(new Set(product.variants.map((v: any) => v.color))) as string[]
    : [];
  
  const availableSizes = product?.variants
    ? Array.from(new Set(product.variants.map((v: any) => v.size))) as string[]
    : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    if (availableSizes.length > 0) {
      setActiveSize(availableSizes[0]);
    }
    setActiveColor(0);
  }, [product]);

  const colors = availableColors.map(colorName => ({
    name: colorName,
    hex: colorName.startsWith('#') ? colorName : (colorHexMap[colorName.toLowerCase()] || '#757575')
  }));

  const sizes = availableSizes;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const selectedColorName = colors[activeColor]?.name;
  
  useEffect(() => {
    if (onColorChange && selectedColorName) {
      onColorChange(selectedColorName);
    }
  }, [selectedColorName, onColorChange]);

  const sizeChartMaster = product?.sizeChartMaster || product?.category?.sizeChartMaster;
  const sizeChartUrl = product?.sizeChart || product?.category?.sizeChart;
  const hasSizeChart = !!(sizeChartMaster || sizeChartUrl);

  const renderTabularSizeChart = (masterData: any) => {
    let sections: any[] = [];
    try {
      sections = typeof masterData === 'string' ? JSON.parse(masterData) : masterData;
    } catch {
      sections = [];
    }
    if (!Array.isArray(sections) || sections.length === 0) return null;

    return (
      <div style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', fontFamily: 'sans-serif', margin: '10px 0', overflowX: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {sections.map((sec: any, idx: number) => (
          <div key={idx} style={{ marginBottom: idx < sections.length - 1 ? '24px' : '0' }}>
            {sec.title && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '2px solid var(--pink-light)', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', color: 'var(--maroon)' }}>
                  {sec.title.toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', fontStyle: 'italic' }}>
                  *All measurements in inches
                </span>
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {sec.headers.map((h: string, hIdx: number) => (
                    <th 
                      key={hIdx} 
                      style={{ 
                        padding: '10px 6px', 
                        fontWeight: '600', 
                        color: '#475569', 
                        textAlign: hIdx === 0 ? 'left' : 'center',
                        fontSize: '12px',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sec.rows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} style={{ borderBottom: rIdx < sec.rows.length - 1 ? '1px solid #f1f5f9' : 'none', background: rIdx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                    {sec.headers.map((h: string, hIdx: number) => (
                      <td 
                        key={hIdx} 
                        style={{ 
                          padding: '10px 6px', 
                          color: hIdx === 0 ? '#0f172a' : '#334155', 
                          fontWeight: hIdx === 0 ? '600' : 'normal', 
                          textAlign: hIdx === 0 ? 'left' : 'center',
                          fontSize: '13px'
                        }}
                      >
                        {row[h] !== undefined && row[h] !== '' ? row[h] : (hIdx === 0 ? row['Size'] || row['size'] || '' : '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const matchingVariant = product?.variants?.find(
    (v: any) => v.size === activeSize && v.color === selectedColorName
  ) || product?.variants?.[0];

  const isOutOfStock = matchingVariant && matchingVariant.stock <= 0;

  // Auto-trigger Buy Now if URL has ?buy=true
  useEffect(() => {
    if (product && matchingVariant) {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('buy') === 'true') {
        // Remove query param to prevent re-triggering on refresh
        navigate(location.pathname, { replace: true });
        
        if (isOutOfStock) {
          toast.error('This variant is currently out of stock');
          return;
        }

        const token = localStorage.getItem('dk_exporting_token');
        if (!token) {
          navigate('/guest-login', {
            state: {
              directBuy: {
                productVariantId: matchingVariant.id,
                quantity: quantity,
                price: matchingVariant.price,
                productName: product.name,
                color: selectedColorName || matchingVariant.color,
                size: activeSize,
                image: product.images?.[0] || ''
              }
            }
          });
        } else {
          setIsCheckoutDrawerOpen(true);
        }
      }
    }
  }, [product, matchingVariant, location.search, navigate, quantity, selectedColorName, activeSize, isOutOfStock]);

  useEffect(() => {
    if (matchingVariant?.id) {
      const token = localStorage.getItem('dk_exporting_token');
      if (token) {
        fetch(`${API_URL}/api/public/stock-notifications/check?productVariantId=${matchingVariant.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setNotifySubscribed(data.subscribed))
          .catch(() => {});
      }
    }
  }, [matchingVariant?.id]);

  const handleNotifyMe = async () => {
    const token = localStorage.getItem('dk_exporting_token');
    if (!token) { toast.error('Please login to get notified'); return; }
    try {
      await fetch(`${API_URL}/api/public/stock-notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productVariantId: matchingVariant.id }),
      });
      setNotifySubscribed(true);
      toast.success('We\'ll notify you when this is back in stock!');
    } catch {
      toast.error('Failed to subscribe');
    }
  };

  const handleAddToCart = () => {
    if (!matchingVariant) {
      toast.error('This variant is currently out of stock');
      return;
    }
    addToCart(product, activeSize, selectedColorName || matchingVariant.color, quantity, matchingVariant.id, matchingVariant.price, matchingVariant.originalPrice);
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!matchingVariant) {
      toast.error('This variant is currently out of stock');
      return;
    }
    
    const token = localStorage.getItem('dk_exporting_token');
    if (!token) {
      navigate('/guest-login', {
        state: {
          directBuy: {
            productVariantId: matchingVariant.id,
            quantity: quantity,
            price: matchingVariant.price,
            productName: product.name,
            color: selectedColorName || matchingVariant.color,
            size: activeSize,
            image: product.images?.[0] || ''
          }
        }
      });
      return;
    }
    
    setIsCheckoutDrawerOpen(true);
  };

  const baseAccordions = [
    { 
      title: 'Product Details', 
      content: (
        <div className="product-details-content">
          <ul className="details-list">
            <li>Colour: lime green</li>
            <li>Solid woven design</li>
            <li>Round neck</li>
            <li>Three-Quarter Sleeves, regular sleeves</li>
            <li>Straight shape</li>
            <li>Thread work detail</li>
            <li>Calf length with straight hem</li>
            <li>Dobby regular cotton</li>
          </ul>

          <h4 className="details-subtitle">Size & Fit</h4>
          <p className="details-text">The model (height 5'8) is wearing a size S</p>

          <h4 className="details-subtitle">Material & Care</h4>
          <p className="details-text">Cotton<br/>Hand Wash</p>

          <h4 className="details-subtitle">Specifications</h4>
          <div className="specifications-grid">
            <div className="spec-item"><span className="spec-key">Sleeve Length</span><span className="spec-val">Three-Quarter Sleeves</span></div>
            <div className="spec-item"><span className="spec-key">Shape</span><span className="spec-val">Straight</span></div>
            <div className="spec-item"><span className="spec-key">Neck</span><span className="spec-val">Round Neck</span></div>
            <div className="spec-item"><span className="spec-key">Design Styling</span><span className="spec-val">Regular</span></div>
            <div className="spec-item"><span className="spec-key">Slit Detail</span><span className="spec-val">Side Slits</span></div>
            <div className="spec-item"><span className="spec-key">Ornamentation</span><span className="spec-val">Thread Work</span></div>
            <div className="spec-item"><span className="spec-key">Length</span><span className="spec-val">Calf Length</span></div>
            <div className="spec-item"><span className="spec-key">Hemline</span><span className="spec-val">Straight</span></div>
            <div className="spec-item"><span className="spec-key">Colour Family</span><span className="spec-val">Bright</span></div>
            <div className="spec-item"><span className="spec-key">Weave Pattern</span><span className="spec-val">Dobby</span></div>
            <div className="spec-item"><span className="spec-key">Weave Type</span><span className="spec-val">Machine Weave</span></div>
            <div className="spec-item"><span className="spec-key">Number of Items</span><span className="spec-val">1</span></div>
            <div className="spec-item"><span className="spec-key">Package Contains</span><span className="spec-val">1 kurta</span></div>
          </div>
        </div>
      )
    },
    { title: 'Shipping', content: <p className="details-text">Free shipping on orders above ₹999. Standard delivery within 3-5 business days.</p> },
    { title: 'Additional Information', content: <p className="details-text">Machine wash cold with like colors. Do not bleach. Tumble dry low.</p> }
  ];

  const sizeChartContent = (
    <div style={{ padding: '5px 0' }}>
      {sizeChartMaster && renderTabularSizeChart(sizeChartMaster.data)}
      {sizeChartUrl && (
        <div style={{ marginTop: sizeChartMaster ? '15px' : '0' }}>
          <img src={getImageUrl(sizeChartUrl)} alt="Size Chart" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '4px' }} />
        </div>
      )}
    </div>
  );

  const accordions = hasSizeChart 
    ? [
        { 
          title: 'Size Chart', 
          content: sizeChartContent
        },
        ...baseAccordions
      ]
    : baseAccordions;

  const handleQtyChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const toggleAccordion = (index: number) => {
    setOpenAccordions(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="product-info-wrap">
      <h1 className="product-title">{product?.name || 'Readymade Cotton Cord Set'}</h1>
      
      <div className="product-price-row">
        <span className="product-price">₹{matchingVariant?.price || product?.price || '0'}</span>
        {(matchingVariant?.originalPrice || product?.originalPrice) && <span className="product-original-price">₹{matchingVariant?.originalPrice || product?.originalPrice}</span>}
      </div>
      <p className="product-tax-note">inclusive of all taxes</p>



      {/* Sizes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="selector-label" style={{ margin: 0 }}>Select Size</span>

      </div>
      <div className="size-options">
        {sizes.map(size => (
          <button 
            key={size}
            className={`size-btn ${activeSize === size ? 'active' : ''}`}
            onClick={() => setActiveSize(size)}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Quantity & Actions */}
      {isOutOfStock ? (
        <div className="qty-action-row" style={{ marginTop: '20px', justifyContent: 'flex-start' }}>
          <button 
            disabled 
            style={{ 
              padding: '14px 40px', 
              background: '#e0e0e0', 
              color: '#888', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 600, 
              fontSize: '15px',
              cursor: 'not-allowed',
              letterSpacing: '1px',
              minWidth: '200px'
            }}
          >
            OUT OF STOCK
          </button>
          <button 
            className={`btn-wishlist-large ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={async () => await toggleWishlist(product.id)}
            aria-label="Wishlist"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          <span className="selector-label">Quantity</span>
          <div className="qty-action-row">
            <div className="qty-selector">
              <button className="qty-btn" onClick={() => handleQtyChange(-1)}>−</button>
              <input 
                type="number" 
                className="qty-input" 
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button className="qty-btn" onClick={() => handleQtyChange(1)}>+</button>
            </div>
            
            <button className="btn-add-cart" onClick={handleAddToCart}>
              ADD TO CART
            </button>
            
            <button className="btn-buy-now" onClick={handleBuyNow}>
              BUY NOW
            </button>

            <button 
              className={`btn-wishlist-large ${isInWishlist(product.id) ? 'active' : ''}`}
              onClick={async () => await toggleWishlist(product.id)}
              aria-label="Wishlist"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </>
      )}


      {/* Accordions */}
      <div className="product-accordions">
        {accordions.map((acc, index) => {
          const isOpen = openAccordions.includes(index);
          return (
            <div key={index} className={`accordion-item ${isOpen ? 'open' : ''}`}>
              <button type="button" className="accordion-header" onClick={() => toggleAccordion(index)}>
                {acc.title}
                <svg className="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {isOpen && (
                <div className="accordion-content">
                  {acc.content}
                </div>
              )}
            </div>
          );
        })}
      </div>




      <CheckoutDrawer 
        isOpen={isCheckoutDrawerOpen} 
        onClose={() => setIsCheckoutDrawerOpen(false)} 
        product={product} 
        variantId={matchingVariant?.id || 0} 
        quantity={quantity} 
        price={matchingVariant?.price || product?.price || 0} 
        size={activeSize} 
      />
    </div>
  );
};

export default ProductInfo;
