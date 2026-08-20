import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
}

const BulkOrderModal: React.FC<BulkOrderModalProps> = ({ isOpen, onClose, products }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    product: '',
    quantity: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('dk_exporting_token');
      if (token) {
        fetch(`${import.meta.env.VITE_API_URL}/api/public/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data) {
              setFormData(prev => ({
                ...prev,
                name: data.name || '',
                phone: data.phone || ''
              }));
            }
          })
          .catch(err => console.error('Failed to fetch profile', err));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/public/bulk-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: formData.quantity ? parseInt(formData.quantity) : null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Your bulk order inquiry has been submitted! We will contact you soon.');
        setFormData({ name: '', phone: '', product: '', quantity: '', note: '' });
        onClose();
      } else {
        toast.error(data.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', padding: '30px', position: 'relative' }}>
        <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#333' }}>
          <X size={24} />
        </button>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Request Bulk Order Quote</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number *</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Product *</label>
            <select 
              name="product" 
              value={formData.product} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff' }}
            >
              <option value="">Select a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
              <option value="Other">Other / Multiple</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Quantity (Optional)</label>
            <input 
              type="number" 
              name="quantity" 
              value={formData.quantity} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Note (Optional)</label>
            <textarea 
              name="note" 
              value={formData.note} 
              onChange={handleChange} 
              rows={4}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="checkout-btn" 
            style={{ marginTop: '10px', padding: '12px' }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkOrderModal;
