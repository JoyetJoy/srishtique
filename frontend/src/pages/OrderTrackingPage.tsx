import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: '📦' },
  { key: 'PROCESSING', label: 'Processing', icon: '⚙️' },
  { key: 'SHIPPED', label: 'Shipped', icon: '🚚' },
  { key: 'DELIVERED', label: 'Delivered', icon: '✅' },
];

const STATUS_ORDER = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const token = localStorage.getItem('dk_exporting_token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetch(`${API_URL}/api/public/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error('Order not found'); return res.json(); })
      .then((data) => { setOrder(data); if (data.rating) { setRatingSubmitted(true); setRating(data.rating.rating); setReview(data.rating.review || ''); } setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id, token, navigate]);

  const submitRating = async () => {
    if (!rating) return;
    try {
      await fetch(`${API_URL}/api/public/orders/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, review }),
      });
      setRatingSubmitted(true);
    } catch {}
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'system-ui' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}><p style={{ color: '#ef4444' }}>{error}</p><Link to="/orders" style={{ color: '#3d2b1f' }}>← Back to Orders</Link></div>;
  if (!order) return null;

  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const address = (() => { try { const a = JSON.parse(order.shippingAddress || '{}'); return a.street ? a : JSON.parse(a.address || '{}'); } catch { return {}; } })();

  return (
    <div style={{ fontFamily: 'system-ui', background: '#fdf6f0', minHeight: '100vh', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Link to="/orders" style={{ color: '#6b5b4f', fontSize: 14, textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>← Back to Orders</Link>
        <h1 style={{ fontSize: 22, color: '#3d2b1f', marginBottom: 8 }}>Order #{order.id}</h1>
        <p style={{ fontSize: 13, color: '#8b7b6f', marginBottom: 24 }}>
          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Timeline */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, color: '#3d2b1f', marginBottom: 20 }}>Order Status</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress line */}
            <div style={{ position: 'absolute', top: 18, left: 24, right: 24, height: 3, background: '#e8ddd0', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 18, left: 24, height: 3, background: '#3d2b1f', zIndex: 1, width: `${Math.min(currentIdx / (STEPS.length - 1), 1) * 100}%`, transition: 'width 0.5s' }} />

            {STEPS.map((step, i) => {
              const isActive = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? '#3d2b1f' : '#e8ddd0', color: isActive ? '#fff' : '#8b7b6f', fontSize: 16,
                    border: isCurrent ? '3px solid #c4a882' : 'none', transition: 'all 0.3s',
                  }}>
                    {step.icon}
                  </div>
                  <span style={{ fontSize: 11, color: isActive ? '#3d2b1f' : '#8b7b6f', marginTop: 8, textAlign: 'center', fontWeight: isCurrent ? 600 : 400 }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tracking info */}
        {(order.trackingNumber || order.shippingMethod) && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, color: '#3d2b1f', marginBottom: 12 }}>Shipping Details</h2>
            {order.shippingMethod && <p style={{ fontSize: 14, color: '#6b5b4f', margin: '0 0 4px' }}><strong>Method:</strong> {order.shippingMethod}</p>}
            {order.trackingNumber && <p style={{ fontSize: 14, color: '#6b5b4f', margin: 0 }}><strong>Tracking:</strong> {order.trackingNumber}</p>}
          </div>
        )}

        {/* Items */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, color: '#3d2b1f', marginBottom: 12 }}>Items</h2>
          {order.items?.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0e6dc' }}>
              <img src={getImageUrl(item.productVariant?.product?.images?.[0])} alt="" style={{ width: 48, height: 56, objectFit: 'cover', borderRadius: 6 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#3d2b1f' }}>{item.productVariant?.product?.name}</div>
                <div style={{ fontSize: 12, color: '#8b7b6f' }}>{item.productVariant?.size} / {item.productVariant?.color} × {item.quantity}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#3d2b1f' }}>₹{(item.priceAtPurchase * item.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid #e8ddd0', fontWeight: 700, fontSize: 16, color: '#3d2b1f' }}>
            <span>Total</span><span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Address */}
        {address.street && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, color: '#3d2b1f', marginBottom: 8 }}>Delivery Address</h2>
            <p style={{ fontSize: 14, color: '#6b5b4f', margin: 0 }}>{address.street}, {address.city}, {address.state} - {address.pincode}</p>
          </div>
        )}

        {/* Rate Order */}
        {order.status === 'DELIVERED' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, color: '#3d2b1f', marginBottom: 12 }}>{ratingSubmitted ? 'Your Review' : 'Rate Your Order'}</h2>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => !ratingSubmitted && setRating(s)} style={{
                  fontSize: 28, background: 'none', border: 'none', cursor: ratingSubmitted ? 'default' : 'pointer',
                  color: s <= rating ? '#f59e0b' : '#d4c5b5', transition: 'color 0.2s',
                }}>★</button>
              ))}
            </div>
            {!ratingSubmitted && (
              <>
                <textarea
                  value={review} onChange={(e) => setReview(e.target.value)} placeholder="Write a review (optional)"
                  style={{ width: '100%', minHeight: 80, padding: 10, border: '1px solid #d4c5b5', borderRadius: 8, fontSize: 14, fontFamily: 'system-ui', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <button onClick={submitRating} disabled={!rating} style={{
                  marginTop: 12, padding: '10px 24px', background: rating ? '#3d2b1f' : '#ccc', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: rating ? 'pointer' : 'not-allowed',
                }}>Submit Review</button>
              </>
            )}
            {ratingSubmitted && <p style={{ fontSize: 14, color: '#6b5b4f', margin: 0 }}>Thanks for your feedback!</p>}
          </div>
        )}
      </div>
    </div>
  );
}
