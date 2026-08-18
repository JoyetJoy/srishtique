import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';

const AdminRestockRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('dk_exporting_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/restock-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch restock requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading requests...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', color: 'var(--maroon)' }}>Restock Requests</h2>
      
      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <p style={{ color: '#64748b' }}>No pending restock requests right now.</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--cream)' }}>
              <tr>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>Product</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>Requested Variant</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>Waitlist Count</th>
                <th style={{ padding: '16px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {req.variant?.product?.images?.[0] ? (
                        <img 
                          src={getImageUrl(req.variant.product.images[0])} 
                          alt={req.variant.product.name}
                          style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <div style={{ width: '50px', height: '60px', background: '#f1f5f9', borderRadius: '4px' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{req.variant?.product?.name || 'Unknown Product'}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>Product ID: {req.variant?.productId}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div>
                      <span style={{ display: 'inline-block', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '13px', marginRight: '8px' }}>
                        Size: {req.variant?.size}
                      </span>
                      <span style={{ display: 'inline-block', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '13px' }}>
                        Color: {req.variant?.color}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      background: 'var(--maroon)', 
                      color: 'white', 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      fontWeight: 600 
                    }}>
                      {req.waitlistCount}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={() => navigate(`/admin/products/edit/${req.variant?.productId}`)}
                      style={{
                        padding: '8px 16px',
                        background: 'white',
                        border: '1px solid var(--maroon)',
                        color: 'var(--maroon)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--maroon)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = 'var(--maroon)';
                      }}
                    >
                      Update Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRestockRequests;
