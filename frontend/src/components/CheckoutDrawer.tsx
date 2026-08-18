import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCheckout } from '../hooks/useCheckout';
import { getImageUrl } from '../utils/imageUrl';
import './CheckoutDrawer.css';
import AddAddressModal from './AddAddressModal';
import toast from 'react-hot-toast';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  variantId: number;
  quantity: number;
  price: number;
  color: string;
  size: string;
}

const CheckoutDrawer = ({ isOpen, onClose, product, variantId, quantity, price, color, size }: CheckoutDrawerProps) => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const { initiateCheckout, loading } = useCheckout();
  const navigate = useNavigate();
  const token = localStorage.getItem('dk_exporting_token');
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
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
  }, [isOpen, token]);

  if (!isOpen) return null;

  const totalAmount = price * quantity;
  const productImage = product?.images?.[0] ? getImageUrl(product.images[0]) : '';

  const handlePay = () => {
    if (!token) {
      navigate('/guest-login');
      return;
    }
    
    initiateCheckout({
      token,
      items: [{ productVariantId: variantId, quantity }],
      addressId: selectedAddressId,
      onSuccess: () => {
        onClose();
        navigate('/orders');
      }
    });
  };

  return createPortal(
    <>
      <div className="checkout-drawer-overlay" onClick={onClose} />
      <div className={`checkout-drawer ${isOpen ? 'open' : ''}`}>
        <div className="checkout-drawer-header">
          <h2>Express Checkout</h2>
          <button onClick={onClose} className="close-drawer-btn"><X size={24} /></button>
        </div>

        <div className="checkout-drawer-content">
          <div className="checkout-item-card">
            <img src={productImage} alt={product?.name} className="checkout-item-img" />
            <div className="checkout-item-info">
              <h4>{product?.name}</h4>
              <p>Size: {size} | Color: {color}</p>
              <p>Qty: {quantity}</p>
              <div className="checkout-item-price">₹{price}</div>
            </div>
          </div>

          <div className="checkout-address-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18} /> Delivery Address</h4>
              {token && (
                <button 
                  type="button"
                  onClick={() => setIsAddAddressModalOpen(true)}
                  style={{ 
                    background: 'var(--maroon)', 
                    color: 'white', 
                    fontWeight: 600, 
                    fontSize: '11px', 
                    padding: '4px 8px', 
                    border: 'none',
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  + Add Address
                </button>
              )}
            </div>
            {!token ? (
              <div className="auth-prompt">
                <p>You need to login to complete your purchase.</p>
                <Link to="/guest-login" className="login-link-btn" onClick={onClose}>Login or Continue as Guest</Link>
              </div>
            ) : addresses.length === 0 ? (
              <div className="auth-prompt">
                <p>You don't have any saved addresses.</p>
                <button type="button" className="login-link-btn" onClick={() => setIsAddAddressModalOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Add New Address</button>
              </div>
            ) : (
              <div className="address-list-compact">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`address-option ${selectedAddressId === addr.id ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="drawer_address" 
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                    />
                    <div className="address-details">
                      <strong>{addr.street}</strong>
                      <span>{addr.city}, {addr.state} {addr.pincode}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="checkout-drawer-footer">
          <div className="total-row">
            <span>Total Amount</span>
            <strong>₹{totalAmount}</strong>
          </div>
          {!token ? (
            <Link 
              to="/guest-login" 
              className="checkout-pay-btn login-cta-btn" 
              onClick={onClose}
            >
              Login or Continue as Guest
            </Link>
          ) : addresses.length === 0 ? (
            <button 
              type="button"
              className="checkout-pay-btn login-cta-btn" 
              onClick={() => setIsAddAddressModalOpen(true)}
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <MapPin size={18} /> Add Delivery Address
            </button>
          ) : (
            <button 
              className="checkout-pay-btn" 
              onClick={handlePay} 
              disabled={loading || !selectedAddressId}
            >
              <Lock size={18} /> {loading ? 'Processing...' : `Pay ₹${totalAmount}`}
            </button>
          )}
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
    </>,
    document.body
  );
};

export default CheckoutDrawer;
