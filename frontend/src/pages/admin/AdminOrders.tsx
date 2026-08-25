import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Eye, Search, Filter, Package, CheckCircle, Truck, Clock, XCircle, User, MapPin, CreditCard, ShoppingBag, Printer } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';
import jsPDF from 'jspdf';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import './AdminCoupons.css'; // Reusing some table styles from AdminCoupons
import './AdminOrders.css';

interface OrderItem {
  id: number;
  quantity: number;
  priceAtPurchase: number;
  productVariant: {
    color: string;
    size: string;
    product: {
      name: string;
      images: any;
    }
  }
}

interface Order {
  id: number;
  orderNumber?: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  user: {
    name: string | null;
    email: string;
    phone?: string | null;
  };
  shippingMethod?: string;
  trackingNumber?: string;
  items: OrderItem[];
}

const AdminOrders = () => {
  const { brandLogoPdf, brandName, brandTagline, brandAddress, brandPhone, brandWebsite, brandInstagram } = useSiteSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Edit State
  const [editStatus, setEditStatus] = useState('');
  const [editShippingMethod, setEditShippingMethod] = useState('Post');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/admin/orders?status=${statusFilter}`;
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      fetchOrders();
      return;
    }
    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      const payload: any = { status: editStatus };
      if (editStatus === 'SHIPPED' || editStatus === 'PROCESSING') {
        payload.shippingMethod = editShippingMethod;
        payload.trackingNumber = editTrackingNumber;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        toast.success(`Order #${selectedOrder.id} updated successfully`);
        fetchOrders();
        setSelectedOrder({ 
          ...selectedOrder, 
          status: editStatus, 
          shippingMethod: (editStatus === 'SHIPPED' || editStatus === 'PROCESSING') ? editShippingMethod : selectedOrder.shippingMethod,
          trackingNumber: (editStatus === 'SHIPPED' || editStatus === 'PROCESSING') ? editTrackingNumber : selectedOrder.trackingNumber
        });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update order');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error updating order');
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditShippingMethod(order.shippingMethod || 'Post');
    setEditTrackingNumber(order.trackingNumber || '');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return { bg: '#fef3c7', text: '#92400e' };
      case 'PROCESSING': return { bg: '#e0f2fe', text: '#0369a1' };
      case 'SHIPPED': return { bg: '#f3e8ff', text: '#6b21a8' };
      case 'DELIVERED': return { bg: '#dcfce7', text: '#166534' };
      case 'CANCELLED': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#334155' };
    }
  };

  const handlePrintOrder = () => {
    if (!selectedOrder) return;

    const generatePdf = (imgElement?: HTMLImageElement) => {
      const doc = new jsPDF({ format: 'a5', orientation: 'landscape' });
      
      // Draw outer double-border in black
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.rect(5, 5, 200, 138); // Outer border
      doc.setLineWidth(0.3);
      doc.rect(6.5, 6.5, 197, 135); // Inner border
      
      // Calculate text width of brand name to center the logo + text block
      doc.setFontSize(22);
      doc.setFont('times', 'normal');
      const titleText = brandName;
      const titleWidth = doc.getTextWidth(titleText);
      
      // Logo size
      const logoWidth = 14;
      const logoHeight = 14;
      const spacing = 4;
      
      // Total block width = logoWidth + spacing + titleWidth
      const totalHeaderWidth = logoWidth + spacing + titleWidth;
      
      // Start X to center the block (page center is 105)
      const startX = 105 - (totalHeaderWidth / 2);
      
      // Logo before the title, centered top
      if (imgElement) {
        doc.addImage(imgElement, 'PNG', startX, 10.5, logoWidth, logoHeight);
      }
      
      // Title - Centered top next to logo
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 0);
      doc.setFont('times', 'normal');
      doc.text(titleText, startX + logoWidth + spacing, 18.5);
      
      // Tagline below title
      const centerXOfTitle = (startX + logoWidth + spacing) + (titleWidth / 2);
      doc.setFontSize(10);
      doc.setFont('times', 'italic');
      doc.setTextColor(71, 85, 105);
      doc.text(brandTagline, centerXOfTitle, 23.5, { align: 'center' });
      
      // Order ID, Shipped By, and Ship To moved near to the disclaimer/declaration section
      const detailsY = 52;

      // Order ID above Shipped By, left-aligned in black
      doc.setFontSize(13);
      doc.setFont('times', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`Order ID: ${selectedOrder.orderNumber || '#' + selectedOrder.id}`, 14, detailsY - 10);
      
      // Shipped By
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Shipped By:', 14, detailsY);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      // Render address lines dynamically
      const brandAddressLines = brandAddress.split('\n').filter(Boolean);
      doc.text(brandName, 14, detailsY + 6);
      brandAddressLines.forEach((line, i) => {
        doc.text(line, 14, detailsY + 11 + (i * 5));
      });
      doc.text(`MOB: ${brandPhone}`, 14, detailsY + 11 + (brandAddressLines.length * 5));

      // Ship To
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Ship To:', 120, detailsY);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(selectedOrder.user.name || 'Guest User', 120, detailsY + 6);
      
      let addressLines: string[] = [];
      let y = detailsY + 11;
      
      if (selectedOrder.user.phone) {
        doc.text(`Phone: ${selectedOrder.user.phone}`, 120, y);
        y += 5;
      }
      
      let customerPhone = '';
      
      try {
        let addrObj = typeof selectedOrder.shippingAddress === 'string' 
          ? JSON.parse(selectedOrder.shippingAddress) 
          : selectedOrder.shippingAddress;
          
        if (addrObj.address && typeof addrObj.address === 'string') {
          try { addrObj = JSON.parse(addrObj.address); } catch (e) { }
        }
        
        if (addrObj.phone && addrObj.phone !== selectedOrder.user.phone) {
          customerPhone = addrObj.phone;
        }
          
        if (addrObj.street || addrObj.city || addrObj.pincode) {
          if (addrObj.street) addressLines.push(addrObj.street);
          addressLines.push([addrObj.city, addrObj.state, addrObj.pincode].filter(Boolean).join(', '));
          if (addrObj.country) addressLines.push(addrObj.country);
        } else {
          addressLines = (addrObj.address || JSON.stringify(addrObj)).split('\n');
        }
      } catch(e) {
        addressLines = (selectedOrder.shippingAddress || '').split('\n');
      }
      
      addressLines.forEach((line: string) => {
        const splitLine = doc.splitTextToSize(String(line), 80);
        doc.text(splitLine, 120, y);
        y += (splitLine.length * 5);
      });
      
      if (customerPhone) {
        doc.text(`Phone: ${customerPhone}`, 120, y);
        y += 5;
      }

      const finalY = Math.max(detailsY + 32, y + 5);
      
      // Add India Post Declaration if shipped via Post
      if (selectedOrder.shippingMethod === 'Post') {
        let decY = finalY + 12;
        
        // If we're too close to the bottom of A5 Landscape (148mm height), add a page
        if (decY > 125) {
          doc.addPage();
          decY = 20;
        }
        
        // Softer text style for stamp declaration box
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text("Customer ID 1453588958", 14, decY);
        
        doc.setFont('times', 'italic'); // Changed to times italic for legal style
        doc.setFontSize(8); // Reduced font size for cleaner presentation
        const declarationText = "Declaration: Certified that the contents of the packet/cover does not contain any articles prohibited for transmission through international air/surface or local post.";
        const splitDeclaration = doc.splitTextToSize(declarationText, 182);
        doc.text(splitDeclaration, 14, decY + 4);
        
        // Draw thin slate box around declaration
        doc.setDrawColor(203, 213, 225); // Slate 200 border
        doc.setLineWidth(0.3);
        doc.rect(12, decY - 5, 186, 6 + (splitDeclaration.length * 4));
      }
      
      // Thank you tagline
      doc.setFontSize(10);
      doc.setFont('times', 'italic');
      doc.setTextColor(0, 0, 0);
      doc.text(`Thank you for shopping with ${brandName}!`, 105, 128, { align: 'center' });

      // Draw footer links (Instagram and website)
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      
      // Instagram Link and Logo on the bottom left
      doc.setDrawColor(71, 85, 105);
      doc.setFillColor(71, 85, 105);
      doc.setLineWidth(0.3);
      doc.roundedRect(14, 135, 4, 4, 0.8, 0.8, 'D');
      doc.circle(16, 137, 0.9, 'D');
      doc.circle(17.1, 135.9, 0.25, 'FD');
      
      const instagramText = brandInstagram;
      doc.text(instagramText, 19.5, 138);
      const textWidth = doc.getTextWidth(instagramText);
      const linkUrl = `https://www.instagram.com/${brandInstagram}`;
      doc.link(14, 134, 6 + textWidth, 6, { url: linkUrl });
      
      // Website Link on the bottom right
      const websiteDisplay = brandWebsite;
      const websiteUrl = brandWebsite.startsWith('http') ? brandWebsite : `https://${brandWebsite}`;
      doc.text(websiteDisplay, 196, 138, { align: 'right' });
      const webWidth = doc.getTextWidth(websiteDisplay);
      doc.link(196 - webWidth, 134, webWidth, 6, { url: websiteUrl });

      doc.save(`${brandName.replace(/\s+/g, '_')}_Order_${selectedOrder.id}.pdf`);
    };

    const img = new Image();
    img.src = brandLogoPdf;
    img.onload = () => generatePdf(img);
    img.onerror = () => generatePdf();
  };

  return (
    <div className="admin-coupons">
      <div className="admin-header">
        <h1>Orders Management</h1>
      </div>

      {!selectedOrder && (
        <>
          {/* Filters Section */}
          <div style={{ display: 'flex', gap: '16px', background: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer Name, or Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#64748b" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '14px', background: 'white', minWidth: '150px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Order Placed</option>
            <option value="PROCESSING">Processing Order</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => {
                const sColor = getStatusColor(order.status);
                return (
                  <tr key={order.id}>
                    <td><strong>{order.orderNumber || '#' + order.id}</strong></td>
                    <td className="text-sm text-gray">{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#334155' }}>{order.user.name || 'Guest'}</div>
                      <div className="text-sm text-gray">{order.user.email}</div>
                      {order.user.phone && <div className="text-sm text-gray">{order.user.phone}</div>}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span style={{ 
                        background: sColor.bg, 
                        color: sColor.text, 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 600 
                      }}>
                        {order.status === 'PENDING' ? 'ORDER PLACED' : order.status === 'PROCESSING' ? 'PROCESSING ORDER' : order.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="action-btn view" onClick={() => openOrderDetails(order)} title="View Details">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      </>
      )}

      {/* Order Details Inline View */}
      {selectedOrder && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Order {selectedOrder.orderNumber || '#' + selectedOrder.id}</h2>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="admin-btn-secondary" 
                onClick={handlePrintOrder}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
              >
                <Printer size={16} /> Print Order
              </button>
              <button className="admin-btn-secondary" onClick={() => setSelectedOrder(null)}>Back to Orders</button>
            </div>
          </div>
          
          <div className="admin-order-details-layout">
            
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Timeline Card */}
              <div className="admin-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#334155', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} /> Order Status
                </h3>
                
                {selectedOrder.status === 'CANCELLED' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444', background: '#fee2e2', padding: '16px', borderRadius: '8px' }}>
                    <XCircle size={24} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '16px' }}>Order Cancelled</div>
                      <div style={{ fontSize: '13px', marginTop: '2px', color: '#b91c1c' }}>Updated on {new Date(selectedOrder.updatedAt).toLocaleString()}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'relative', margin: '0 24px 24px 24px' }}>
                    {/* Progress Bar Background */}
                    <div style={{ position: 'absolute', top: '16px', left: '0', right: '0', height: '4px', background: '#e2e8f0', zIndex: 0, borderRadius: '2px' }}></div>
                    
                    {/* Progress Bar Fill */}
                    <div style={{ 
                      position: 'absolute', top: '16px', left: '0', 
                      width: selectedOrder.status === 'DELIVERED' ? '100%' : selectedOrder.status === 'SHIPPED' ? '66%' : selectedOrder.status === 'PROCESSING' ? '33%' : '0%', 
                      height: '4px', background: 'var(--maroon)', zIndex: 0, borderRadius: '2px', transition: 'width 0.4s ease' 
                    }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                      {[
                        { id: 'PENDING', label: 'Order Placed', icon: Package },
                        { id: 'PROCESSING', label: 'Processing', icon: Clock },
                        { id: 'SHIPPED', label: 'Shipped', icon: Truck },
                        { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle }
                      ].map((step, idx) => {
                        const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                        const currentIndex = statusOrder.indexOf(selectedOrder.status);
                        const isCompleted = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;
                        const Icon = step.icon;

                        return (
                          <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                            <div className={isCurrent ? "status-active-pulse" : ""} style={{ 
                              width: '36px', height: '36px', borderRadius: '50%', 
                              background: isCompleted ? 'var(--maroon)' : '#f8fafc',
                              border: isCompleted ? '2px solid var(--maroon)' : '2px solid #cbd5e1',
                              color: isCompleted ? 'white' : '#94a3b8',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              marginBottom: '12px',
                              transition: 'all 0.3s ease'
                            }}>
                              <Icon size={16} />
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: isCurrent ? 600 : 500, color: isCompleted ? '#334155' : '#94a3b8', textAlign: 'center' }}>
                              {step.label}
                            </div>
                            {isCurrent && (
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', textAlign: 'center' }}>
                                {new Date(selectedOrder.updatedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items Card */}
              <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={18} /> Items Ordered ({selectedOrder.items.length})
                  </h3>
                </div>
                
                <div style={{ padding: '0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#fcfcfc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Product</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '12px 24px', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: idx === selectedOrder.items.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                {item.productVariant.product.images?.[0] ? (
                                  <img src={getImageUrl(item.productVariant.product.images[0], true)} onError={(e) => { (e.target as HTMLImageElement).src = getImageUrl(item.productVariant.product.images[0]); }} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><Package size={24} /></div>
                                )}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px', marginBottom: '4px' }}>{item.productVariant.product.name}</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>
                                  Size: {item.productVariant.size}
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>₹{item.priceAtPurchase.toLocaleString('en-IN')} each</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 500, color: '#334155' }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                            ₹{(item.quantity * item.priceAtPurchase).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Order Summary Card */}
              <div className="admin-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#334155', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} /> Payment Summary
                </h3>
                
                {(() => {
                  const subtotal = selectedOrder.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
                  const discount = subtotal - selectedOrder.totalAmount;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#475569' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal</span>
                        <span>₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                          <span>Discount (Coupon/Offer)</span>
                          <span>-₹{discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Shipping</span>
                        <span>Free</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tax (included)</span>
                        <span>₹0</span>
                      </div>
                      
                      <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#0f172a', fontSize: '16px' }}>
                        <span>Total Amount</span>
                        <span style={{ color: 'var(--maroon)' }}>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Customer Details Card */}
              <div className="admin-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#334155', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} /> Customer Details
                </h3>
                
                <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 500 }}>{selectedOrder.user.name || 'Guest User'}</div>
                  <a href={`mailto:${selectedOrder.user.email}`} style={{ color: '#0284c7', textDecoration: 'none', display: 'inline-block', marginBottom: '4px' }}>{selectedOrder.user.email}</a>
                  {selectedOrder.user.phone && <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>{selectedOrder.user.phone}</div>}
                  
                  <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '16px' }}></div>
                  
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} /> Shipping Address
                  </h3>
                  
                  {(() => {
                    try {
                      let addrObj = typeof selectedOrder.shippingAddress === 'string' 
                        ? JSON.parse(selectedOrder.shippingAddress) 
                        : selectedOrder.shippingAddress;
                        
                      if (addrObj.address && typeof addrObj.address === 'string') {
                        try { addrObj = JSON.parse(addrObj.address); } catch (e) { }
                      }
                        
                      if (addrObj.street || addrObj.city || addrObj.pincode) {
                        return (
                          <div style={{ color: '#475569' }}>
                            {addrObj.street && <div>{addrObj.street}</div>}
                            <div>{[addrObj.city, addrObj.state, addrObj.pincode].filter(Boolean).join(', ')}</div>
                            {addrObj.country && <div>{addrObj.country}</div>}
                          </div>
                        );
                      }
                      return <div style={{ whiteSpace: 'pre-wrap', color: '#475569' }}>{addrObj.address || JSON.stringify(addrObj, null, 2)}</div>;
                    } catch(e) {
                      return <div style={{ whiteSpace: 'pre-wrap', color: '#475569' }}>{selectedOrder.shippingAddress}</div>;
                    }
                  })()}
                </div>
              </div>

              {/* Update Status Card */}
              <div className="admin-card" style={{ padding: '24px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#334155', margin: '0 0 16px 0' }}>Update Status</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Order Status</label>
                    <select 
                      value={editStatus} 
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ 
                        padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', 
                        fontSize: '14px', fontWeight: 500, width: '100%', background: 'white'
                      }}
                    >
                      <option value="PENDING">Order Placed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  {(editStatus === 'SHIPPED' || editStatus === 'PROCESSING') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px', fontWeight: 500 }}>Shipping Provider</label>
                        <select 
                          value={editShippingMethod} 
                          onChange={(e) => setEditShippingMethod(e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc' }}
                        >
                          <option value="Post">India Post</option>
                          <option value="Courier">Private Courier (e.g., Delhivery, BlueDart)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#475569', marginBottom: '4px', fontWeight: 500 }}>Tracking Number / AWB</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 1Z9999999999999999"
                          value={editTrackingNumber}
                          onChange={(e) => setEditTrackingNumber(e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc' }}
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleSaveStatus}
                    style={{ 
                      background: 'var(--maroon)', color: 'white', border: 'none', 
                      padding: '12px', borderRadius: '6px', cursor: 'pointer', 
                      fontWeight: 600, fontSize: '14px', width: '100%',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
