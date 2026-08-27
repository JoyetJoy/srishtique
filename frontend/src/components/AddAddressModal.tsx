import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { X, MapPin } from 'lucide-react';

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSaved: (newAddress: any) => void;
  customToken?: string;
}

import { Country, State } from 'country-state-city';

const AddAddressModal: React.FC<AddAddressModalProps> = ({ isOpen, onClose, onAddressSaved, customToken }) => {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);

  const [street, setStreet] = useState('');
  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = customToken || localStorage.getItem('dk_exporting_token');

  useEffect(() => {
    if (isOpen) {
      const allCountries = Country.getAllCountries();
      setCountries(allCountries);
      // Auto select India if found
      const india = allCountries.find(c => c.name.toLowerCase() === 'india');
      if (india) {
        setCountryId(india.isoCode);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (countryId) {
      const countryStates = State.getStatesOfCountry(countryId);
      setStates(countryStates);
    } else {
      setStates([]);
    }
  }, [countryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !countryId || !stateId || !city || !pincode) {
      setError('Please fill in all address fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const countryName = countries.find(c => c.isoCode === countryId)?.name || '';
      const stateName = states.find(s => s.isoCode === stateId)?.name || '';

      const body = {
        street,
        country: countryName,
        state: stateName,
        city,
        pincode,
        isDefault
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/user/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address');

      // Reset form
      setStreet('');
      setCountryId('');
      setStateId('');
      setCity('');
      setPincode('');
      setIsDefault(false);

      onAddressSaved(data.address);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving address');
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="admin-modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ width: '500px', maxWidth: '95vw', padding: '24px', borderRadius: '12px', background: 'white', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--maroon)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} /> Add New Address
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', border: '1px solid #fee2e2' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Street Address / Landmark</label>
            <textarea 
              value={street} 
              onChange={e => setStreet(e.target.value)} 
              placeholder="House No, Building, Street, Area..." 
              required 
              style={{ ...inputStyle, height: '70px', padding: '10px 12px', resize: 'vertical', fontFamily: 'inherit' }} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Country</label>
              <Select 
                options={countries.map(c => ({ value: c.isoCode, label: c.name }))}
                value={countries.filter(c => c.isoCode === countryId).map(c => ({ value: c.isoCode, label: c.name }))[0] || null}
                onChange={(selected: any) => { setCountryId(selected ? selected.value : ''); setStateId(''); }}
                placeholder="Select Country..."
                styles={reactSelectStyles}
                isSearchable
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>State</label>
              <Select 
                options={states.map(s => ({ value: s.isoCode, label: s.name }))}
                value={states.filter(s => s.isoCode === stateId).map(s => ({ value: s.isoCode, label: s.name }))[0] || null}
                onChange={(selected: any) => setStateId(selected ? selected.value : '')}
                placeholder="Select State..."
                isDisabled={!countryId}
                styles={reactSelectStyles}
                isSearchable
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>City</label>
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Pincode</label>
              <input 
                type="text" 
                value={pincode} 
                onChange={e => setPincode(e.target.value)} 
                placeholder="Pincode / ZIP" 
                maxLength={10}
                required 
                style={inputStyle} 
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155', marginTop: '4px' }}>
            <input 
              type="checkbox" 
              checked={isDefault} 
              onChange={e => setIsDefault(e.target.checked)}
              style={{ accentColor: 'var(--maroon)', width: '16px', height: '16px' }}
            />
            Make this my default address
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '8px 20px', background: 'var(--maroon)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressModal;
