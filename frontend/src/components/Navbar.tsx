import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../utils/imageUrl';
import './Navbar.css';
import Logo from './Logo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, clearCart } = useCart();
  const { wishlistItems } = useWishlist();

  const isLoggedIn = !!localStorage.getItem('dk_exporting_token');

  useEffect(() => {
    const token = localStorage.getItem('dk_exporting_token');
    if (!token) return;

    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/api/notifications?token=${token}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ITEM_RESTOCKED') {
          import('react-hot-toast').then(module => {
            const toast = module.default;
            toast.success(
              <div>
                <b>Good news!</b><br/>
                {data.productData.name} is back in stock!
              </div>,
              { duration: 8000 }
            );
          });
        }
      } catch (e) {
        // ignore
      }
    };

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/products?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.slice(0, 5)); // show up to 5 matches
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('dk_exporting_token');
    localStorage.removeItem('srishtique_cart');
    clearCart();
    setIsProfileOpen(false);
    navigate('/login');
  };

  return (
    <header className="navbar" onMouseLeave={() => setIsProfileOpen(false)}>
      <nav className="navbar-main">
        <div className="container navbar-inner">
          {/* Logo */}
          <Logo variant="header-light" size="md" />

          {/* Nav Links */}
          <ul className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
            <li><Link to="/" onClick={() => setIsMenuOpen(false)} className={`nav-link ${isActive('/') ? 'active' : ''}`}>HOME</Link></li>
            <li><Link to="/products" onClick={() => setIsMenuOpen(false)} className={`nav-link ${isActive('/products') ? 'active' : ''}`}>PRODUCTS</Link></li>
            <li><Link to="/about" onClick={() => setIsMenuOpen(false)} className={`nav-link ${isActive('/about') ? 'active' : ''}`}>ABOUT US</Link></li>
            <li><Link to="/contact" onClick={() => setIsMenuOpen(false)} className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>CONTACT</Link></li>

            {/* Mobile Only Profile & Wishlist Links */}
            <li className="mobile-only-li"><Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className={`nav-link ${isActive('/wishlist') ? 'active' : ''}`}>WISHLIST {wishlistItems.length > 0 && `(${wishlistItems.length})`}</Link></li>
            <li className="mobile-only-li">
              {isLoggedIn ? (
                <>
                  <Link to="/address" onClick={() => setIsMenuOpen(false)} className={`nav-link ${isActive('/address') ? 'active' : ''}`}>PROFILE</Link>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>ORDERS</Link>
                  <span onClick={handleLogout} className="nav-link" style={{ cursor: 'pointer', color: 'var(--maroon)' }}>LOGOUT</span>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className={`nav-link ${isActive('/login') ? 'active' : ''}`}>LOGIN</Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)} className={`nav-link ${isActive('/signup') ? 'active' : ''}`}>SIGN UP</Link>
                </>
              )}
            </li>
          </ul>

          {/* Icons */}
          <div className="navbar-icons">
            <div className="nav-search-container">
              <input
                type="text"
                placeholder="Search products..."
                className={`nav-search-input ${isSearchOpen ? 'open' : ''}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                className="icon-btn" 
                aria-label="Search" 
                onClick={() => {
                  if (isSearchOpen && searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    setIsSearchOpen(false);
                  } else {
                    setIsSearchOpen(!isSearchOpen);
                    if (!isSearchOpen) {
                      setTimeout(() => {
                        const input = document.querySelector('.nav-search-input') as HTMLInputElement;
                        if (input) input.focus();
                      }, 100);
                    }
                  }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>

              {isSearchOpen && searchQuery && (
                <div className="nav-search-dropdown">
                  {isSearching ? (
                    <div className="nav-search-msg">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((product: any) => (
                      <Link 
                        key={product.id} 
                        to={`/product/${product.id}`} 
                        className="nav-search-result-item"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <img src={getImageUrl(product.images?.[0])} alt={product.name} />
                        <div>
                          <div className="nav-search-result-name">{product.name}</div>
                          <div className="nav-search-result-type">
                            {product.type === 'ORNAMENT' ? 'Ornament' : 'Clothing'}
                            {product.variants?.[0]?.size && ` • Size: ${product.variants[0].size}`}
                            {product.variants?.[0]?.price && <span style={{ color: '#d32f2f', fontWeight: 600, marginLeft: '4px' }}>₹{product.variants[0].price}</span>}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="nav-search-msg">No results found</div>
                  )}
                </div>
              )}
            </div>
            <Link to="/wishlist" className="icon-btn desktop-only" aria-label="Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23L19.78 13.45L20.84 12.39a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistItems.length > 0 && <span className="icon-badge">{wishlistItems.length}</span>}
            </Link>

            <Link to="/cart" className="icon-btn" aria-label="Cart" style={{ textDecoration: 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
            </Link>

            <div className="nav-dropdown desktop-only" style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                aria-label="Profile"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {isProfileOpen && (
                <div className="dropdown-menu" style={{ right: 0, left: 'auto', display: 'block', opacity: 1, visibility: 'visible', transform: 'translateY(0)', minWidth: '150px' }}>
                  {isLoggedIn ? (
                    <>
                      <Link to="/address" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '10px 20px', textDecoration: 'none' }}>Profile</Link>
                      <Link to="/orders" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '10px 20px', textDecoration: 'none' }}>Orders</Link>
                      <Link to="/wishlist" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '10px 20px', textDecoration: 'none' }}>Wishlist</Link>
                      <span className="dropdown-item" onClick={handleLogout} style={{ display: 'block', padding: '10px 20px', cursor: 'pointer', color: 'var(--maroon)' }}>Logout</span>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '10px 20px', textDecoration: 'none' }}>Login</Link>
                      <Link to="/signup" className="dropdown-item" onClick={() => setIsProfileOpen(false)} style={{ display: 'block', padding: '10px 20px', textDecoration: 'none' }}>Sign Up</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
