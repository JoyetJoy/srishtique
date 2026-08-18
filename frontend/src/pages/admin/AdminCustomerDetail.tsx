import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        setCustomer(await res.json());
      } else {
        navigate('/admin/customers');
      }
    } catch (e) {
      console.error(e);
      navigate('/admin/customers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading customer details...</div>;
  if (!customer) return <div>Customer not found</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Customer Profile</h2>
        <button className="admin-btn-secondary" onClick={() => navigate('/admin/customers')}>Back to Customers</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Customer Info Card */}
        <div className="admin-card" style={{ height: 'fit-content' }}>
          <h4 style={{ margin: '0 0 16px 0' }}>Profile</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Customer ID</label>
              <div style={{ fontWeight: 500 }}>#{customer.id}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Email</label>
              <div style={{ fontWeight: 500 }}>{customer.email}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Joined Date</label>
              <div style={{ fontWeight: 500 }}>{new Date(customer.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Email Verified</label>
              <div style={{ fontWeight: 500, color: customer.isEmailVerified ? '#10b981' : '#f59e0b' }}>
                {customer.isEmailVerified ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="admin-card">
          <h4 style={{ margin: '0 0 16px 0' }}>Order History</h4>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders?.map((order: any) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      backgroundColor: order.status === 'DELIVERED' ? '#dcfce7' : '#fef9c3',
                      color: order.status === 'DELIVERED' ? '#166534' : '#854d0e'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>₹{order.totalAmount}</td>
                  <td>
                    {order.items.length} item(s)
                  </td>
                </tr>
              ))}
              {(!customer.orders || customer.orders.length === 0) && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>This customer hasn't placed any orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerDetail;
