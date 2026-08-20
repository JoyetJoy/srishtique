import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Calendar, Package, Hash, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminLayout.css'; 

interface BulkOrder {
  id: number;
  name: string;
  phone: string;
  product: string;
  quantity?: number;
  note?: string;
  status: string;
  createdAt: string;
}

const AdminBulkOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<BulkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('dk_exporting_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/bulk-orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bulk order details');
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      const token = localStorage.getItem('dk_exporting_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/bulk-orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update status');
      
      toast.success('Status updated successfully');
      setOrder({ ...order, status: newStatus });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="admin-loading">Loading order details...</div>;
  if (error || !order) return <div className="admin-error">{error || 'Order not found'}</div>;

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={() => navigate('/admin/bulk-orders')} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '5px', 
            padding: '8px 16px', background: 'transparent', 
            color: '#4a3b32', border: '1px solid #e0d5c1', 
            borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
            fontWeight: '500', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#f5f0e6'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>Order #{order.id} Details</h2>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '1000px' }}>
        
        {/* Customer Info Card */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#4a3b32', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
            <User size={18} /> Customer Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>NAME</span>
              <div style={{ fontSize: '15px', color: '#333', fontWeight: '500' }}>{order.name}</div>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>PHONE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', color: '#333' }}>
                <Phone size={14} color="#888" /> {order.phone}
              </div>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>DATE SUBMITTED</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', color: '#333' }}>
                <Calendar size={14} color="#888" /> {new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#4a3b32', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
            <Package size={18} /> Request Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>PRODUCT</span>
              <div style={{ fontSize: '15px', color: '#333', fontWeight: '500' }}>{order.product}</div>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>QUANTITY</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', color: '#333' }}>
                <Hash size={14} color="#888" /> {order.quantity || 'Not specified'}
              </div>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>STATUS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={14} color="#888" />
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ 
                    padding: '8px 12px', borderRadius: '6px', border: '1px solid #e0e0e0', 
                    background: '#f9f9f9', color: '#333', fontSize: '14px', fontWeight: '500',
                    cursor: 'pointer', outline: 'none'
                  }}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Card - Spans full width */}
        <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#4a3b32', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
            <FileText size={18} /> Additional Notes
          </h3>
          <div style={{ 
            background: order.note ? '#fcfaf7' : '#f9f9f9', 
            padding: '20px', borderRadius: '8px', 
            minHeight: '100px', whiteSpace: 'pre-wrap',
            color: order.note ? '#333' : '#aaa',
            border: '1px solid #f0f0f0',
            lineHeight: '1.6', fontSize: '15px'
          }}>
            {order.note || 'No additional notes provided by the customer.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBulkOrderDetail;
