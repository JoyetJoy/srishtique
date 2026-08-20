import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLayout.css'; // Re-use common admin styles if appropriate

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

const AdminBulkOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('dk_exporting_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/bulk-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch bulk orders');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);



  if (loading) return <div className="admin-loading">Loading bulk orders...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Bulk Orders</h2>
      </div>
      
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No bulk orders found.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.name}</td>
                  <td>{order.phone}</td>
                  <td>{order.product}</td>
                  <td>{order.quantity || '-'}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: order.status === 'PENDING' ? '#fff3cd' : order.status === 'CONTACTED' ? '#cce5ff' : '#d4edda',
                      color: order.status === 'PENDING' ? '#856404' : order.status === 'CONTACTED' ? '#004085' : '#155724'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => navigate(`/admin/bulk-orders/${order.id}`)}
                      style={{ padding: '6px 12px', background: '#3e2723', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBulkOrders;
