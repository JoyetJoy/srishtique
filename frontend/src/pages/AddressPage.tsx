import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, MapPin, Plus } from 'lucide-react';
import Select from 'react-select';
import { Country, State } from 'country-state-city';

import StaticSEO from '../components/StaticSEO';

const AddressPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hasPassword, setHasPassword] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Addresses state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  // Location selectors states
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  // Form states
  const [street, setStreet] = useState('');
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('dk_exporting_token');

  const fetchProfile = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/public/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setName(data.name || '');
        setEmail(data.email || '');
        setHasPassword(data.hasPassword);
        setAddresses(data.addresses || []);
      })
      .catch(() => setError('Failed to load profile'));
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
    
    setCountries(Country.getAllCountries());
  }, [token, navigate]);

  useEffect(() => {
    if (countryId) {
      setStates(State.getStatesOfCountry(countryId));
    } else {
      setStates([]);
    }
  }, [countryId]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const countryName = countries.find(c => c.isoCode === countryId)?.name || '';
      const stateName = states.find(s => s.isoCode === stateId)?.name || '';

      const body = {
        street, country: countryName, state: stateName, city, pincode, isDefault
      };

      const url = editingAddressId 
        ? `${import.meta.env.VITE_API_URL}/api/public/user/addresses/${editingAddressId}`
        : `${import.meta.env.VITE_API_URL}/api/public/user/addresses`;
        
      const method = editingAddressId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address');

      setSuccess('Address saved successfully!');
      setShowAddressForm(false);
      setEditingAddressId(null);
      resetAddressForm();
      fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/user/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete address');
      setSuccess('Address deleted successfully!');
      fetchProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/user/addresses/${id}/default`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to set default address');
      fetchProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const editAddress = (address: any) => {
    setStreet(address.street);
    const cId = countries.find(c => c.name === address.country)?.isoCode || '';
    setCountryId(cId);
    if (cId) {
        const cStates = State.getStatesOfCountry(cId);
        setStateId(cStates.find(s => s.name === address.state)?.isoCode || '');
    } else {
        setStateId('');
    }
    setCity(address.city || '');
    setPincode(address.pincode);
    setIsDefault(address.isDefault);
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setStreet('');
    setCountryId('');
    setStateId('');
    setCity('');
    setPincode('');
    setIsDefault(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/user/set-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set password');

      setSuccess(data.message);
      setHasPassword(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reactSelectStyles = {
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

  const inputStyle = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  } as React.CSSProperties;

  return (
    <div style={{ minHeight: '80vh', padding: '60px 20px', background: '#f8fafc' }}>
      <StaticSEO 
        pagePath="/address" 
        defaultTitle="Your Addresses - DK Exporting | Delivery Address" 
        defaultDescription="Manage your saved delivery addresses for seamless checkout at DK Exporting." 
      />
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '24px', flexDirection: 'column' }}>
        
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '32px', fontFamily: 'Playfair Display', color: 'var(--maroon)', margin: '0 0 8px 0' }}>My Profile</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Manage your personal information and addresses.</p>
        </div>

        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', border: '1px solid #fee2e2' }}>{error}</div>}
        {success && <div style={{ color: '#059669', background: '#ecfdf5', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', border: '1px solid #d1fae5' }}>{success}</div>}

        {/* Profile Info Section */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'Playfair Display', color: 'var(--text-dark)', marginBottom: '24px' }}>Personal Information</h2>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Email Address</label>
                <input type="email" value={email} disabled style={{ ...inputStyle, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ background: 'var(--maroon)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Addresses Section */}
        <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontFamily: 'Playfair Display', color: 'var(--text-dark)', margin: 0 }}>My Addresses</h2>
            {!showAddressForm && (
              <button 
                onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--maroon)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
              >
                <Plus size={16} /> Add Address
              </button>
            )}
          </div>

          {!showAddressForm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  <MapPin size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                  <p>You haven't added any addresses yet.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: addr.isDefault ? '#f8fafc' : 'white' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{addr.street}</span>
                        {addr.isDefault && <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: 500 }}>Default</span>}
                      </div>
                      <p style={{ color: '#64748b', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                        {addr.city}, {addr.state}<br/>
                        {addr.country} - {addr.pincode}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => editAddress(addr)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDeleteAddress(addr.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                      {!addr.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(addr.id)} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', color: '#475569' }}>
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveAddress} style={{ border: '1px solid #e2e8f0', padding: '24px', borderRadius: '8px', background: '#f8fafc' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e293b' }}>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Street Address</label>
                  <input type="text" value={street} onChange={e => setStreet(e.target.value)} required placeholder="House number, street name" style={inputStyle} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Country</label>
                    <Select 
                      options={countries.map(c => ({ value: c.isoCode, label: c.name }))}
                      value={countries.filter(c => c.isoCode === countryId).map(c => ({ value: c.isoCode, label: c.name }))[0] || null}
                      onChange={(selected: any) => { setCountryId(selected ? selected.value : ''); setStateId(''); }}
                      placeholder="Search Country..."
                      styles={reactSelectStyles}
                      isSearchable
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>State</label>
                    <Select 
                      options={states.map(s => ({ value: s.isoCode, label: s.name }))}
                      value={states.filter(s => s.isoCode === stateId).map(s => ({ value: s.isoCode, label: s.name }))[0] || null}
                      onChange={(selected: any) => { setStateId(selected ? selected.value : ''); }}
                      placeholder="Search State..."
                      isDisabled={!countryId}
                      styles={reactSelectStyles}
                      isSearchable
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>City</label>
                    <input 
                      type="text" 
                      value={city} 
                      onChange={e => setCity(e.target.value)} 
                      placeholder="City / District / Town" 
                      required 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Pincode</label>
                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} required placeholder="Pincode / ZIP" maxLength={10} style={inputStyle} />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  Make this my default address
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={loading} style={{ background: 'var(--maroon)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  {loading ? 'Saving...' : 'Save Address'}
                </button>
                <button type="button" onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }} style={{ background: 'white', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Set Password Section */}
        {!hasPassword && (
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '20px', fontFamily: 'Playfair Display', color: 'var(--text-dark)', marginBottom: '8px' }}>Set Password</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Since you logged in as a guest, you can set a password here to easily log in as a normal customer in the future.
            </p>
            
            <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} style={inputStyle} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} style={inputStyle} />
              </div>
              
              <button type="submit" disabled={loading || !newPassword || !confirmPassword} style={{ background: 'var(--maroon)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
                {loading ? 'Saving...' : 'Set Password'}
              </button>
            </form>
          </div>
        )}



      </div>
    </div>
  );
};

export default AddressPage;
