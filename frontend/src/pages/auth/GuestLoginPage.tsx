import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import './AuthPages.css';
import Select from 'react-select';
import StaticSEO from '../../components/StaticSEO';
import AddAddressModal from '../../components/AddAddressModal';
import { MapPin } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

const GuestLoginPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Verification states
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [guestToken, setGuestToken] = useState('');
  
  // Location states
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  const [street, setStreet] = useState('');
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);

  const handleSelectSavedAddress = async (addr: any) => {
    setSelectedAddressId(addr.id);
    setStreet(addr.street);
    setPincode(addr.pincode);
    setCity(addr.city || '');
    const foundCountry = countries.find(c => c.name === addr.country);
    if (foundCountry) {
      setCountryId(foundCountry.id.toString());
      const stRes = await fetch(`${import.meta.env.VITE_API_URL}/api/public/states?countryId=${foundCountry.id}`);
      const stData = await stRes.json();
      const foundState = stData.find((s: any) => s.name === addr.state);
      if (foundState) {
        setStateId(foundState.id.toString());
      }
    }
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  
  const locationState = location.state as any;
  const directBuy = locationState?.directBuy;

  // Load Razorpay SDK
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fetch countries
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/public/countries`)
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('Failed to load countries', err));
  }, []);

  // Fetch states
  useEffect(() => {
    if (countryId) {
      fetch(`${import.meta.env.VITE_API_URL}/api/public/states?countryId=${countryId}`)
        .then(res => res.json())
        .then(data => setStates(data))
    } else {
      setStates([]);
    }
  }, [countryId]);

  const handleVerifyPhoneClick = async () => {
    if (!phone) {
      setError('Please enter your mobile number first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Use signup endpoint to send OTP
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      toast.success('OTP sent to your mobile number!');
      setShowOtpModal(true);
    } catch(err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-guest-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp: otp.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      setIsPhoneVerified(true);
      setIsNewUser(data.isNewUser);
      setShowOtpModal(false);
      setGuestToken(data.token);
      toast.success('Mobile number verified!');

      // Try to fetch profile to pre-fill address
      try {
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/public/user/profile`, {
          headers: { 'Authorization': `Bearer ${data.token}` }
        });
        const profileData = await profileRes.json();
        
        if (profileData.name) {
          const nameParts = profileData.name.split(' ');
          setFirstName(nameParts[0]);
          if (nameParts.length > 1) {
            setLastName(nameParts.slice(1).join(' '));
          }
        }
        
        if (profileData.addresses && profileData.addresses.length > 0) {
          setSavedAddresses(profileData.addresses);
          const defaultAddr = profileData.addresses.find((a: any) => a.isDefault) || profileData.addresses[0];
          handleSelectSavedAddress(defaultAddr);
        }
      } catch (e) {
        console.error("Could not prefill address", e);
      }

    } catch(err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneVerified) {
      setError('Please verify your mobile number first.');
      return;
    }
    
    if (isNewUser && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!street || !countryId || !stateId || !city || !pincode) {
      setError('Please fill out all address fields.');
      return;
    }

    if (!firstName) {
      setError('First name is required.');
      return;
    }

    if (!directBuy && cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const countryName = countries.find(c => c.id === Number(countryId))?.name || '';
      const stateName = states.find(s => s.id === Number(stateId))?.name || '';

      const addressObj = {
        street,
        country: countryName,
        countryId: Number(countryId),
        state: stateName,
        stateId: Number(stateId),
        city,
        pincode
      };

      // 1. Checkout Register (Saves Password & Address)
      const regRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/checkout-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phone.trim(),
          email: email.trim(), 
          password: isNewUser ? password : '',
          addressObj: selectedAddressId ? undefined : addressObj,
          addressId: selectedAddressId || undefined,
          name: `${firstName.trim()} ${lastName.trim()}`.trim()
        })
      });

      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.error || 'Failed to complete registration');

      const token = regData.token || guestToken;
      const addressId = regData.addressId;
      setGuestToken(token);

      // 2. Initiate Order
      const orderItems = directBuy 
        ? [{ productVariantId: directBuy.productVariantId, quantity: directBuy.quantity }]
        : cartItems.map(item => ({
            productVariantId: item.variantId,
            quantity: item.quantity
          }));

      const isLoaded = await loadRazorpay();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load.');

      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/public/orders/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: orderItems, addressId })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to initiate order');

      if (orderData.amount === 0) {
        if (!directBuy) {
          clearCart();
          fetch(`${import.meta.env.VITE_API_URL}/api/public/cart/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ items: [] })
          }).catch(console.error);
        }
        navigate(`/payment-success?orderId=${orderData.order.id}`);
        return;
      }

      const options = {
        key: orderData.razorpayKeyId,
        amount: Math.round(orderData.amount * 100),
        currency: 'INR',
        name: 'DK Exporting',
        description: 'Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify Payment
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/public/orders/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.order.id
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success('Payment successful! Your order has been placed.');
              if (!directBuy) {
                clearCart();
                fetch(`${import.meta.env.VITE_API_URL}/api/public/cart/track`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ items: [] })
                }).catch(console.error);
              }
              navigate('/orders');
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
              navigate(`/payment-failed?orderId=${orderData.order.id}`);
            }
          } catch (err) {
            console.error(err);
            toast.error('Payment verification failed');
            navigate(`/payment-failed?orderId=${orderData.order.id}`);
          }
        },
        prefill: {
          name: regData.user?.name || '',
          phone: phone.trim(),
          email: email.trim(),
        },
        theme: {
          color: '#80011F'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error?.description || 'Payment failed');
        navigate(`/payment-failed?orderId=${orderData.order.id}`);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: '40px',
      borderColor: '#cbd5e1',
      borderRadius: '6px',
      boxShadow: state.isFocused ? '0 0 0 1px #cbd5e1' : 'none',
      '&:hover': { borderColor: '#cbd5e1' },
      background: state.isDisabled ? '#f8fafc' : 'white',
      fontSize: '14px'
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '0 12px'
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: '4px'
    })
  };

  return (
    <div className="auth-page" style={{ padding: '40px 0' }}>
      <StaticSEO 
        pagePath="/guest-login" 
        defaultTitle="Guest Login - DK Exporting | Continue as Guest" 
        defaultDescription="Login or continue as guest to complete your DK Exporting purchase quickly with OTP mobile verification." 
      />
      <div className="auth-container" style={{ maxWidth: '600px', padding: '32px', margin: '0 auto' }}>
        <h2>Checkout & Register</h2>
        <p className="auth-subtitle">Complete your purchase quickly.</p>

        {directBuy && (
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '16px', border: '1px solid #e2e8f0' }}>
            {directBuy.image && (
              <img src={getImageUrl(directBuy.image)} alt={directBuy.productName} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
            )}
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px' }}>{directBuy.productName}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px' }}>
                Color: {directBuy.color} | Size: {directBuy.size} | Qty: {directBuy.quantity}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--maroon)' }}>₹{directBuy.price * directBuy.quantity}</div>
            </div>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handlePlaceOrder} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="auth-form-group">
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
                style={inputStyle}
              />
            </div>
            <div className="auth-form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                style={inputStyle}
              />
            </div>
          </div>
          
          <div className="auth-form-group">
            <label>Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address for order updates"
              style={inputStyle}
            />
          </div>
          <div className="auth-form-group">
            <label>Mobile Number <span style={{color: 'red'}}>*</span></label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your mobile number"
                required
                disabled={isPhoneVerified}
                style={{ ...inputStyle, background: isPhoneVerified ? '#f8fafc' : 'white' }}
              />
              {!isPhoneVerified && (
                <button 
                  type="button" 
                  className="auth-btn" 
                  onClick={handleVerifyPhoneClick}
                  disabled={loading || !phone}
                  style={{ width: 'auto', padding: '0 20px', whiteSpace: 'nowrap' }}
                >
                  Verify Mobile
                </button>
              )}
            </div>
            {isPhoneVerified && <span style={{ color: '#16a34a', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Verified</span>}
          </div>

          {isPhoneVerified && isNewUser && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="auth-form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={18} /> Shipping Address
            </h3>
            {isPhoneVerified && (
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
            )}
          </div>

          {isPhoneVerified && savedAddresses.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {savedAddresses.map((addr) => (
                <label 
                  key={addr.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '12px', 
                    cursor: 'pointer', 
                    padding: '12px', 
                    border: selectedAddressId === addr.id ? '2px solid var(--maroon)' : '1px solid var(--border)', 
                    borderRadius: '8px', 
                    background: selectedAddressId === addr.id ? 'var(--pink-bg)' : 'white', 
                    transition: 'all 0.2s' 
                  }}
                >
                  <input 
                    type="radio" 
                    name="guest_shipping_address" 
                    checked={selectedAddressId === addr.id}
                    onChange={() => handleSelectSavedAddress(addr)}
                    style={{ marginTop: '3px', accentColor: 'var(--maroon)' }}
                  />
                  <div style={{ flex: 1, fontSize: '14px', lineHeight: '1.4' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                      {addr.street} {addr.isDefault && <span style={{ fontSize: '11px', background: 'var(--maroon)', color: 'white', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>Default</span>}
                    </div>
                    <div style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '2px' }}>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </div>
                    <div style={{ color: 'var(--text-light)', fontSize: '13px' }}>
                      {addr.country}
                    </div>
                  </div>
                </label>
              ))}
              <button 
                type="button"
                onClick={() => {
                  setSelectedAddressId(null);
                  setStreet('');
                  setPincode('');
                  setCity('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--maroon)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', textDecoration: 'underline', marginTop: '4px' }}
              >
                {selectedAddressId === null ? '▼ Entering custom address below:' : '+ Or enter a different address manually below'}
              </button>
            </div>
          )}

          {(savedAddresses.length === 0 || selectedAddressId === null) && (
            <>
              <div className="auth-form-group">
                <label>Street Address</label>
                <textarea
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat/House No, Building, Street, Area"
                  required={selectedAddressId === null}
                  rows={3}
                  style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', lineHeight: '1.5', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="auth-form-group">
                  <label>Country</label>
                  <Select 
                    options={countries.map(c => ({ value: c.id.toString(), label: c.name }))}
                    value={countries.filter(c => c.id.toString() === countryId).map(c => ({ value: c.id.toString(), label: c.name }))[0] || null}
                    onChange={(selected: any) => {
                      setCountryId(selected ? selected.value : '');
                      setStateId('');
                    }}
                    placeholder="Search Country..."
                    styles={selectStyles}
                    isSearchable
                    required={selectedAddressId === null}
                  />
                </div>

                <div className="auth-form-group">
                  <label>State</label>
                  <Select 
                    options={states.map(s => ({ value: s.id.toString(), label: s.name }))}
                    value={states.filter(s => s.id.toString() === stateId).map(s => ({ value: s.id.toString(), label: s.name }))[0] || null}
                    onChange={(selected: any) => {
                      setStateId(selected ? selected.value : '');
                    }}
                    placeholder="Search State..."
                    isDisabled={!countryId}
                    styles={selectStyles}
                    isSearchable
                    required={selectedAddressId === null}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="auth-form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                    placeholder="City / District / Town" 
                    required={selectedAddressId === null} 
                  />
                </div>

                <div className="auth-form-group">
                  <label>Pincode</label>
                  <input 
                    type="text" 
                    value={pincode} 
                    onChange={e => setPincode(e.target.value)} 
                    required={selectedAddressId === null} 
                    placeholder="Pincode / ZIP"
                    maxLength={10}
                    style={inputStyle}
                  />
                </div>
              </div>
            </>
          )}

              <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: '24px', height: '48px', fontSize: '16px' }}>
                {loading ? 'Processing...' : (isNewUser && isPhoneVerified ? 'Register & Place Order' : 'Place Order')}
              </button>
        </form>

        {/* OTP Modal */}
        {showOtpModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '20px' }}>Enter OTP</h3>
              <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '14px' }}>We sent a 6-digit code to {phone}.</p>
              
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '4px', marginBottom: '24px' }}
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowOtpModal(false)}
                  style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  style={{ flex: 1, padding: '12px', background: 'var(--maroon)', border: 'none', borderRadius: '6px', fontWeight: 600, color: 'white', cursor: 'pointer' }}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Address Modal */}
        <AddAddressModal 
          isOpen={isAddAddressModalOpen} 
          onClose={() => setIsAddAddressModalOpen(false)} 
          customToken={guestToken}
          onAddressSaved={(newAddr) => {
            setSavedAddresses(prev => [...prev, newAddr]);
            handleSelectSavedAddress(newAddr);
            toast.success('Address saved and selected!');
          }} 
        />

      </div>
    </div>
  );
};

export default GuestLoginPage;
