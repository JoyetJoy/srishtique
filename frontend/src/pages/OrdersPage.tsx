import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import Loader from '../components/Loader';
import StaticSEO from '../components/StaticSEO';

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('dk_exporting_token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/public/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to retrieve orders');
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, navigate]);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="orders-page container" style={{ padding: '40px 16px 80px', maxWidth: '800px', margin: '0 auto' }}>
      <StaticSEO 
        pagePath="/orders" 
        defaultTitle="Your Orders - DK Exporting | Order History" 
        defaultDescription="View and track your previous DK Exporting orders, shipment status, and order details." 
      />
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '32px' }}>Your Orders</h1>

      {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '24px' }}>{error}</div>}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>No orders placed yet</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>You haven't ordered anything yet. Explore our products to find something you love!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(order => {
            const addressObj = JSON.parse(order.shippingAddress || '{}');
            return (
              <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: 'white' }}>
                {/* Header */}
                <div style={{ background: '#f8fafc', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '24px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 500 }}>Order Placed</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 500 }}>Total</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: 600 }}>₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 500 }}>Status</span>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      padding: '4px 8px', 
                      borderRadius: '12px',
                      background: order.status === 'DELIVERED' ? '#d1fae5' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                      color: order.status === 'DELIVERED' ? '#065f46' : order.status === 'CANCELLED' ? '#991b1b' : '#92400e'
                    }}>
                      {order.status === 'PENDING' ? 'ORDER PLACED' : order.status === 'PROCESSING' ? 'PROCESSING ORDER' : order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {order.items?.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <img 
                          src={getImageUrl(item.productVariant?.product?.images?.[0])} 
                          alt={item.productVariant?.product?.name} 
                          style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 2px 0' }}>{item.productVariant?.product?.name}</h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Size: {item.productVariant?.size} | Qty: {item.quantity}</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                          ₹{((item.priceAtPurchase || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '20px 0 16px 0' }} />
                  
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)', display: 'block', marginBottom: '4px' }}>Shipping Address:</span>
                    {(() => {
                      try {
                        const parsed = addressObj.address ? JSON.parse(addressObj.address) : addressObj;
                        if (parsed && parsed.street) {
                          return `${parsed.street}, ${parsed.city}, ${parsed.state}, ${parsed.country} - ${parsed.pincode}`;
                        }
                      } catch (e) {
                        // ignore and fall back
                      }
                      return addressObj.address || order.shippingAddress || 'No shipping address provided.';
                    })()}
                  </div>

                  {(order.shippingMethod || order.trackingNumber) && (
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                      <span style={{ fontWeight: 600, color: 'var(--maroon)', display: 'block', marginBottom: '4px' }}>Shipping Information:</span>
                      {order.shippingMethod && <div><strong>Method:</strong> {order.shippingMethod}</div>}
                      {order.trackingNumber && <div><strong>Tracking No:</strong> {order.trackingNumber}</div>}
                    </div>
                  )}

                  <div style={{ marginTop: '16px' }}>
                    <Link
                      to={`/orders/${order.id}/track`}
                      style={{
                        display: 'inline-block', padding: '8px 16px', background: 'var(--maroon)', color: '#fff',
                        borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                      }}
                    >
                      Track Order →
                    </Link>

                    {order.status === 'SHIPPED' && order.trackingNumber && (
                      <a
                        href={order.shippingMethod === 'Post' ? `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx` : `https://www.google.com/search?q=${encodeURIComponent(order.trackingNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block', padding: '8px 16px', background: '#3b82f6', color: '#fff',
                          borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                          marginLeft: '12px'
                        }}
                      >
                        Track Shipment (External) ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
