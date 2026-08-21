import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import CheckoutDrawer from './CheckoutDrawer';
import toast from 'react-hot-toast';
import FadeIn from './FadeIn';
import './ProductSection.css';
import OrnamentDivider from './OrnamentDivider';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
  variantId?: number;
  size?: string;
  color?: string;
  isOutOfStock?: boolean;
}

interface ProductSectionProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  description?: React.ReactNode;
  products: any[];
  viewAllLink?: string;
  columns?: number;
  centered?: boolean;
  mobileGrid?: boolean;
}



export const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(
      product,
      product.size || '',
      product.color || '',
      1,
      product.variantId || 0,
      product.price || 0,
      product.originalPrice
    );
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('dk_exporting_token');
    if (!token) {
      navigate('/guest-login', {
        state: {
          directBuy: {
            productVariantId: product.variantId || 0,
            quantity: 1,
            price: product.price || 0,
            productName: product.name,
            color: product.color || '',
            size: product.size || '',
            image: product.image || ''
          }
        }
      });
      return;
    }
    
    setIsCheckoutDrawerOpen(true);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-img-wrap">
        <Link to={`/product/${product.id}`} className="product-image-link">
          <div className="product-image-container">
            <img src={getImageUrl(product.image)} alt={product.name} loading="lazy" />
          </div>
        </Link>
        {product.badge && <span className="product-badge">{product.badge}</span>}

        <div className="product-actions">
          <button
            className={`wishlist-action-btn ${isWishlisted ? 'active' : ''}`}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await toggleWishlist(product.id);
            }}
            aria-label="Wishlist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <Link to={`/product/${product.id}`} className="quick-view-btn">
            VIEW DETAILS
          </Link>
        </div>
      </div>
      <div className="product-info">
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-price-row">
          <span className="product-price" style={{ fontSize: '15px' }}>₹{(product.price || 0).toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="product-orig-price" style={{ fontSize: '11px' }}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
        <div className="product-card-buttons">
          {product.isOutOfStock ? (
            <button 
              disabled 
              style={{ 
                width: '100%', 
                padding: '10px 0', 
                background: '#e0e0e0', 
                color: '#888', 
                border: 'none', 
                fontWeight: 600, 
                fontSize: '12px',
                cursor: 'not-allowed',
                letterSpacing: '1px'
              }}
            >
              OUT OF STOCK
            </button>
          ) : (
            <>
              <button className="card-buy-now" onClick={handleBuyNow}>
                BUY NOW
              </button>
              <button className="card-add-to-cart" onClick={handleAddToCart} aria-label="Add to Cart">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div onClick={e => e.stopPropagation()}>
        <CheckoutDrawer 
          isOpen={isCheckoutDrawerOpen} 
          onClose={() => setIsCheckoutDrawerOpen(false)} 
          product={{...product, images: [product.image]}} 
          variantId={product.variantId || 0} 
          quantity={1} 
          price={product.price || 0} 
          size={product.size || ''} 
        />
      </div>
    </div>
  );
};

const ProductSection = ({ title, subtitle, eyebrow, description, products, viewAllLink = '#', columns, centered, mobileGrid }: ProductSectionProps) => {
  return (
    <section className="product-section">
      <div className="container">
        {centered ? (
          <div className="section-header-centered">
            <OrnamentDivider />
            {eyebrow && <p className="section-eyebrow-centered">{eyebrow}</p>}
            <h2>{title}</h2>
            {subtitle && <p className="section-subtitle-centered">{subtitle}</p>}
          </div>
        ) : (
          <div className="section-header" style={{ alignItems: 'flex-end' }}>
            <div>
              {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
              <h2 className="section-title product-title">{title}</h2>
              {subtitle && <p className="section-subtitle">{subtitle}</p>}
            </div>
            {description ? (
              <p className="section-desc">{description}</p>
            ) : viewAllLink && (
              <Link to={viewAllLink} className="view-all-link">
                VIEW ALL <span aria-hidden="true" style={{ fontSize: '16px' }}>&rarr;</span>
              </Link>
            )}
          </div>
        )}
        <div className={`product-grid ${products.length < (columns || 5) ? 'centered-grid' : ''} ${mobileGrid ? 'grid-2-col-mobile' : ''}`} style={columns ? { '--desktop-cols': columns } as React.CSSProperties : undefined}>
          {products.map((p, index) => (
            <FadeIn key={p.id} delay={0.05 * index} direction="up" duration={0.6} className="h-full">
              <ProductCard product={p} />
            </FadeIn>
          ))}
        </div>
        {viewAllLink && centered && (
          <div className="section-cta">
            <Link to={viewAllLink} className="btn-outline explore-btn">EXPLORE COLLECTIONS</Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
