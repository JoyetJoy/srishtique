import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './AdminCoupons.css';

interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  validFrom: string | null;
  validUntil: string | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFirstPurchaseOnly, setIsFirstPurchaseOnly] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/coupons`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load coupons');
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setMinOrderValue('');
    setMaxDiscount('');
    setValidFrom('');
    setValidUntil('');
    setUsageLimit('');
    setIsActive(true);
    setIsFirstPurchaseOnly(false);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setIsEditing(true);
    setCurrentId(c.id);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue.toString());
    setMinOrderValue(c.minOrderValue ? c.minOrderValue.toString() : '');
    setMaxDiscount(c.maxDiscount ? c.maxDiscount.toString() : '');
    setValidFrom(c.validFrom ? new Date(c.validFrom).toISOString().slice(0, 16) : '');
    setValidUntil(c.validUntil ? new Date(c.validUntil).toISOString().slice(0, 16) : '');
    setUsageLimit(c.usageLimit ? c.usageLimit.toString() : '');
    setIsActive(c.isActive);
    setIsFirstPurchaseOnly((c as any).isFirstPurchaseOnly);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        toast.success('Coupon deleted');
        fetchCoupons();
      } else {
        toast.error('Failed to delete coupon');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error deleting coupon');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom: validFrom ? new Date(validFrom).toISOString() : null,
        validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        isActive,
        isFirstPurchaseOnly
      };

      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/admin/coupons/${currentId}`
        : `${import.meta.env.VITE_API_URL}/api/admin/coupons`;
      
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(isEditing ? 'Coupon updated' : 'Coupon created');
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save coupon');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving coupon');
    }
  };

  return (
    <div className="admin-coupons">
      <div className="admin-header">
        <h1>Coupons</h1>
        <button className="admin-btn" onClick={openCreateModal}>
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.NO</th>
              <th>Code</th>
              <th>Discount</th>
              <th>Usage</th>
              <th>Dates</th>
              <th>Flags</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, index) => (
              <tr key={c.id}>
                <td>{index + 1}</td>
                <td><strong>{c.code}</strong></td>
                <td>
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  {c.maxDiscount && <div className="text-sm text-gray">Up to ₹{c.maxDiscount}</div>}
                </td>
                <td>
                  {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'used'}
                </td>
                <td className="text-sm text-gray">
                  <div>From: {c.validFrom ? new Date(c.validFrom).toLocaleDateString() : 'Always'}</div>
                  <div>To: {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'Forever'}</div>
                </td>
                <td>
                  {(c as any).isFirstPurchaseOnly && <span className="tag">First Purchase</span>}
                </td>
                <td>
                  <span className={`status-badge ${c.isActive ? 'active' : 'inactive'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="action-btn edit" onClick={() => openEditModal(c)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>No coupons found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>{isEditing ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="admin-form-group">
                <label>Coupon Code *</label>
                <input 
                  type="text" 
                  className="admin-input"
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  required 
                  placeholder="e.g. SUMMER20"
                />
              </div>

              <div className="form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>Discount Type *</label>
                  <select className="admin-input" value={discountType} onChange={(e) => setDiscountType(e.target.value as any)}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>Discount Value *</label>
                  <input 
                    type="number" 
                    className="admin-input"
                    min="0" 
                    step="0.01" 
                    value={discountValue} 
                    onChange={(e) => setDiscountValue(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>Minimum Order Value (₹)</label>
                  <input 
                    type="number" 
                    className="admin-input"
                    min="0" 
                    value={minOrderValue} 
                    onChange={(e) => setMinOrderValue(e.target.value)} 
                    placeholder="Optional"
                  />
                </div>
                
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>Max Discount (₹) {discountType === 'FIXED' && '(N/A)'}</label>
                  <input 
                    type="number" 
                    className="admin-input"
                    min="0" 
                    value={maxDiscount} 
                    onChange={(e) => setMaxDiscount(e.target.value)} 
                    placeholder="Optional"
                    disabled={discountType === 'FIXED'}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>Valid From</label>
                  <input 
                    type="datetime-local" 
                    className="admin-input"
                    value={validFrom} 
                    onChange={(e) => setValidFrom(e.target.value)} 
                  />
                </div>
                
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>Valid Until</label>
                  <input 
                    type="datetime-local" 
                    className="admin-input"
                    value={validUntil} 
                    onChange={(e) => setValidUntil(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="admin-form-group" style={{ flex: 1 }}>
                  <label>Usage Limit (Total Users)</label>
                  <input 
                    type="number" 
                    className="admin-input"
                    min="1" 
                    value={usageLimit} 
                    onChange={(e) => setUsageLimit(e.target.value)} 
                    placeholder="Optional"
                  />
                </div>
                
                <div className="admin-form-group" style={{ flex: 1, marginTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isActive} 
                      onChange={(e) => setIsActive(e.target.checked)} 
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <div className="admin-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isFirstPurchaseOnly} 
                    onChange={(e) => setIsFirstPurchaseOnly(e.target.checked)} 
                  />
                  <span>First Purchase Only</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
