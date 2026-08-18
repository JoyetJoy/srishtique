import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductSection';
import { useWishlist } from '../context/WishlistContext';
import Loader from '../components/Loader';
import StaticSEO from '../components/StaticSEO';
import './WishlistPage.css';

const WishlistPage = () => {
  const { wishlistItems } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('dk_exporting_token');

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        if (wishlistItems.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/public/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map((item: any) => {
            const p = item.product;
            if (!p) return null;
            return {
              id: p.id,
              name: p.name,
              price: p.variants?.[0]?.price || p.price || 0,
              originalPrice: p.variants?.[0]?.originalPrice || null,
              image: p.images?.[0] || '',
              rating: 5,
              reviews: 12,
              variantId: p.variants?.[0]?.id,
              size: p.variants?.[0]?.size,
              color: p.variants?.[0]?.color,
              isOutOfStock: !p.variants || p.variants.length === 0 || p.variants.every((v: any) => v.stock <= 0)
            };
          }).filter(Boolean);
          setProducts(formatted);
        }
      } catch (e) {
        console.error('Failed to fetch wishlist products', e);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProducts();
  }, [token, wishlistItems.length]);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!token) {
    return (
      <div className="wishlist-empty">
        <StaticSEO pagePath="/wishlist" defaultTitle="Your Wishlist - DK Exporting" defaultDescription="View the items you have saved to your wishlist." />
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        <h2>Please log in to view your wishlist</h2>
        <Link to="/login" className="btn-primary">Login Now</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <StaticSEO pagePath="/wishlist" defaultTitle="Your Wishlist - DK Exporting" defaultDescription="View the items you have saved to your wishlist." />
      <div className="wishlist-header">
        <h1>My Wishlist <span className="wishlist-count">({products.length} items)</span></h1>
      </div>
      
      {products.length === 0 ? (
        <div className="wishlist-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love and buy them later.</p>
          <Link to="/" className="btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
