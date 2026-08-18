import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StaticSEO from '../components/StaticSEO';
import { getImageUrl } from '../utils/imageUrl';
import { Trash2, Lock, ChevronLeft, X, Tag, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCheckout } from '../hooks/useCheckout';
import './CartPage.css';
import AddAddressModal from '../components/AddAddressModal';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { initiateCheckout, loading } = useCheckout();
  const [error, setError] = useState('');
  
  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [activeCoupons, setActiveCoupons] = useState<any[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  
  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem('dk_exporting_token');

  // Fetch addresses on mount if logged in
  // Fetch addresses on mount if logged in
  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/api/public/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.addresses && data.addresses.length > 0) {
            setAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: any) => a.isDefault);
            setSelectedAddressId(defaultAddr ? defaultAddr.id : data.addresses[0].id);
          }
        })
        .catch(err => console.error(err));
    }
  }, []);

  const totalMRP = cartItems.reduce((acc, item) => acc + ((item.originalPrice || item.price) * item.quantity), 0);
  const totalDiscount = totalMRP - cartTotal;
  
  const finalTotal = appliedCoupon ? Math.max(cartTotal - (appliedCoupon.discountAmount || 0), 0) : cartTotal;

  useEffect(() => {
    fetchActiveCoupons();
  }, []);

  const fetchActiveCoupons = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/coupons/active`);
      if (res.ok) {
        setActiveCoupons(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyCoupon = async (codeOverride?: string) => {
    const codeToApply = codeOverride || couponInput.trim();
    if (!codeToApply) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setCouponError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/validate-coupon`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token') || ''}`
        },
        body: JSON.stringify({ code: codeToApply, cartTotal })
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Invalid coupon';
        setCouponError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      setAppliedCoupon(data.coupon);
      setCouponInput('');
      setIsCouponModalOpen(false);
      toast.success('Coupon applied successfully!');
    } catch (err) {
      setCouponError('Failed to validate coupon');
      toast.error('Failed to validate coupon');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const handlePlaceOrder = () => {
    setError('');

    const orderItems = cartItems.map(item => ({
      productVariantId: item.variantId,
      quantity: item.quantity
    }));

    initiateCheckout({
      token,
      items: orderItems,
      addressId: selectedAddressId,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      onSuccess: () => {
        clearCart();
        navigate('/orders');
      },
      onError: (err) => {
        setError(err);
      }
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <StaticSEO pagePath="/cart" defaultTitle="Your Cart - DK Exporting" defaultDescription="Review the items in your shopping cart before checkout." />
        <div style={{ textAlign: 'center', background: 'white', padding: '60px 40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', maxWidth: '500px', width: '100%' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <h2 style={{ fontSize: '24px', fontFamily: 'Playfair Display', color: 'var(--maroon)', marginBottom: '8px' }}>Your Cart is Empty</h2>
          <p style={{ color: '#666', fontSize: '15px', marginBottom: '32px' }}>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" style={{ background: 'var(--maroon)', color: 'white', border: 'none', padding: '14px 32px', borderRadius: '6px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ChevronLeft size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page min-h-screen bg-gray-50 py-12 pt-24">
      <StaticSEO pagePath="/cart" defaultTitle="Your Cart - DK Exporting" defaultDescription="Review the items in your shopping cart before checkout." />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="cart-header-top">
          <div>
            <h1 className="cart-page-title">Your Cart ({cartItems.length})</h1>
            <p className="cart-page-subtitle">Looks good on you! You're just a few steps away from making it yours.</p>
          </div>
          <Link to="/" className="continue-shopping-btn">
            <ChevronLeft size={16} /> Continue Shopping
          </Link>
        </div>
        
        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '24px', border: '1px solid #fee2e2' }}>{error}</div>}

        <div className="cart-layout">
          
          {/* Cart Items Section */}
          <div className="cart-items-section">
            {/* Address Selection */}
            {token && (
              <div style={{ marginTop: '0', marginBottom: '12px', padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: addresses.length > 0 ? '12px' : '0' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--maroon)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <MapPin size={16} /> Delivery Address
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {addresses.length > 1 && (
                      <button 
                        onClick={() => setIsAddressExpanded(!isAddressExpanded)}
                        style={{ background: 'none', border: 'none', color: 'var(--maroon)', fontWeight: 600, fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {isAddressExpanded ? 'Done' : 'Change'}
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => setIsAddAddressModalOpen(true)} 
                      style={{ 
                        background: 'var(--maroon)', 
                        color: 'white', 
                        fontWeight: 600, 
                        fontSize: '12px', 
                        padding: '6px 12px', 
                        border: 'none',
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 4px rgba(128, 0, 32, 0.15)',
                        transition: 'all 0.2s'
                      }}
                    >
                      + Add Address
                    </button>
                  </div>
                </div>
                {addresses.length === 0 ? (
                  <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic' }}>
                    No delivery address saved yet. Click "+ Add Address" above to add one.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {addresses
                      .filter(addr => isAddressExpanded || addr.id === selectedAddressId)
                      .map((addr) => (
                      <label key={addr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: isAddressExpanded ? 'pointer' : 'default', padding: '12px', border: selectedAddressId === addr.id ? '2px solid var(--maroon)' : '1px solid var(--border)', borderRadius: '8px', background: selectedAddressId === addr.id ? 'var(--pink-bg)' : 'white', transition: 'all 0.2s' }}>
                        {isAddressExpanded && (
                          <input 
                            type="radio" 
                            name="delivery_address" 
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            style={{ marginTop: '4px', accentColor: 'var(--maroon)', width: '16px', height: '16px' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                            {addr.street} {addr.isDefault && <span style={{ fontSize: '10px', background: 'var(--maroon)', color: 'white', padding: '2px 6px', borderRadius: '12px', marginLeft: '6px', fontWeight: 500 }}>Default</span>}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px', lineHeight: '1.4' }}>
                            {addr.city}, {addr.state} {addr.pincode}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {isAddressExpanded && addresses.length > 0 && (
                  <button type="button" onClick={() => setIsAddAddressModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--maroon)', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '10px 20px', background: 'var(--pink-bg)', borderRadius: '6px' }}>
                    + Add New Address
                  </button>
                )}
              </div>
            )}

            <div className="cart-items-header">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                Select All ({cartItems.length})
              </label>
              <button onClick={clearCart} className="clear-cart-btn">
                <Trash2 size={16} /> Clear Cart
              </button>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => {
                const itemTotal = item.price * item.quantity;
                const discountPercent = item.originalPrice && item.originalPrice > item.price 
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
                  : 0;

                return (
                  <div key={item.id} className="cart-item-card">
                    <input type="checkbox" className="item-checkbox" defaultChecked />
                    <img src={getImageUrl(item.image)} alt={item.name} className="item-image" />
                    
                    <div className="item-details">
                      <h3 className="item-title">{item.name}</h3>
                      <div className="item-variant">
                        <span>{item.color}</span>
                        <span>{item.size}</span>
                      </div>
                      
                      <div className="item-price-row">
                        <span className="item-price-current">₹{item.price.toLocaleString('en-IN')}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <>
                          {item.originalPrice != null && (
                            <span className="item-price-original">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                          )}
                            <span className="item-discount-badge">{discountPercent}% OFF</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="item-quantity-wrapper">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="quantity-btn">−</button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="quantity-btn">+</button>
                    </div>

                    <div className="item-total-wrapper">
                      <div className="item-total-price">₹{itemTotal.toLocaleString('en-IN')}</div>
                      <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coupons Modal */}
          {isCouponModalOpen && (
            <div className="admin-modal-overlay" onClick={() => setIsCouponModalOpen(false)}>
              <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ width: '400px', maxWidth: '90vw' }}>
                <div className="admin-modal-header" style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Available Coupons</h4>
                  <button className="admin-modal-close" onClick={() => setIsCouponModalOpen(false)}>&times;</button>
                </div>
                
                {couponError && (
                  <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                    {couponError}
                  </div>
                )}
                
                <div className="coupons-list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {activeCoupons.map(c => (
                    <div key={c.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary)', border: '1px dashed var(--primary)', padding: '4px 8px', borderRadius: '4px', background: '#f5f3ff' }}>{c.code}</span>
                        <button 
                          className="apply-btn" 
                          style={{ padding: '4px 12px', fontSize: '14px', borderRadius: '4px' }}
                          onClick={() => handleApplyCoupon(c.code)}
                        >
                          Apply
                        </button>
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#334155' }}>
                        Get {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                        {c.minOrderValue && ` on orders above ₹${c.minOrderValue}`}
                      </p>
                      {c.isFirstPurchaseOnly && <p style={{ margin: 0, fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>First purchase only</p>}
                    </div>
                  ))}
                  {activeCoupons.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No active coupons available at the moment.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Summary Section */}
          <div className="order-summary-card">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({cartItems.length} items)</span>
              <span className="value">₹{totalMRP.toLocaleString('en-IN')}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span className="value">- ₹{totalDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            {appliedCoupon && (
              <div className="summary-row discount" style={{ color: '#166534' }}>
                <span>Coupon ({appliedCoupon.code})</span>
                <span className="value">- ₹{(appliedCoupon.discountAmount || 0).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span className="value">FREE</span>
            </div>
            
            <hr className="summary-divider" />
            
            <div className="summary-total-row">
              <span className="summary-total-label">Total Amount</span>
              <span className="summary-total-value">₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
            
            {totalDiscount > 0 && (
              <div className="savings-text">
                You saved ₹{totalDiscount.toLocaleString('en-IN')} on this order!
              </div>
            )}

            <div className="coupon-section">
              <h4 className="coupon-title">
                <Tag size={16} /> Apply Coupon
              </h4>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px dashed #22c55e', padding: '12px', borderRadius: '6px' }}>
                  <div>
                    <strong style={{ color: '#166534', display: 'block', marginBottom: '2px' }}>{appliedCoupon.code} Applied</strong>
                    <span style={{ fontSize: '12px', color: '#15803d' }}>You save ₹{appliedCoupon.discountAmount || 0}</span>
                  </div>
                  <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="coupon-input-group">
                    <input 
                      type="text" 
                      placeholder="Coupon Code" 
                      className="coupon-input"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    />
                    <button className="coupon-apply-btn" onClick={() => handleApplyCoupon()}>APPLY</button>
                  </div>
                  <button 
                    className="view-coupons-btn" 
                    onClick={() => setIsCouponModalOpen(true)}
                    style={{ marginTop: '8px', width: '100%', padding: '8px', background: 'transparent', border: '1px dashed var(--maroon)', color: 'var(--maroon)', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    View All Coupons
                  </button>
                  {couponError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{couponError}</p>}
                </div>
              )}
            </div>


            
            <button 
              onClick={handlePlaceOrder}
              disabled={loading}
              className="checkout-btn"
            >
              <Lock size={16} /> {loading ? 'Processing...' : 'PROCEED TO CHECKOUT'}
            </button>


          </div>
        </div>
      </div>
      <AddAddressModal 
        isOpen={isAddAddressModalOpen} 
        onClose={() => setIsAddAddressModalOpen(false)} 
        onAddressSaved={(newAddr) => {
          setAddresses(prev => [...prev, newAddr]);
          setSelectedAddressId(newAddr.id);
          toast.success('Address saved and selected!');
        }} 
      />
    </div>
  );
};

export default CartPage;
