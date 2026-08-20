import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import './AdminLayout.css';
import { useCart } from '../../context/CartContext';

const AdminLayout = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'Overview': false,
    'Sales & Users': false,
    'Catalog': false,
    'Storefront': false,
    'Marketing': false,
    'System': false
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem('dk_exporting_token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'SUPER_ADMIN') {
        navigate('/');
      }
    } catch (e) {
      navigate('/login');
    }

    const tokenPayload = localStorage.getItem('dk_exporting_token');
    if (!tokenPayload) return;

    // Connect to SSE for notifications
    const sse = new EventSource(`${import.meta.env.VITE_API_URL}/api/notifications?token=${tokenPayload}`);
    
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_ORDER') {
          setNotifications(prev => [{ ...data.order, notifType: 'order' }, ...prev]);
        } else if (data.type === 'NEW_RESTOCK_REQUEST') {
          setNotifications(prev => [{ notifType: 'restock', message: 'A customer joined a restock waitlist!', createdAt: new Date() }, ...prev]);
        }
      } catch(e) {}
    };

    return () => {
      sse.close();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('dk_exporting_token');
    localStorage.removeItem('dk_cart');
    clearCart();
    navigate('/login');
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { 
          name: 'Dashboard', 
          path: '/admin',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        }
      ]
    },
    {
      title: 'Sales & Users',
      items: [
        {
          name: 'Orders',
          path: '/admin/orders',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        },
        {
          name: 'Bulk Orders',
          path: '/admin/bulk-orders',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
        },
        { 
          name: 'Customers', 
          path: '/admin/customers',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        },
        {
          name: 'Coupons',
          path: '/admin/coupons',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15h20v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4Z"></path><path d="M2 9v4h20V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M12 12h.01"></path></svg>
        }
      ]
    },
    {
      title: 'Catalog',
      items: [
        { 
          name: 'Products', 
          path: '/admin/products',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        },
        { 
          name: 'Categories', 
          path: '/admin/categories',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        },
      ]
    },
    {
      title: 'Storefront',
      items: [
        { 
          name: 'Testimonials', 
          path: '/admin/testimonials',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        }
      ]
    },
    {
      title: 'Marketing',
      items: [
        {
          name: 'SEO Manager',
          path: '/admin/seo',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><circle cx="12" cy="12" r="4"></circle></svg>
        }
      ]
    },
    {
      title: 'System',
      items: [
        { 
          name: 'Settings', 
          path: '/admin/settings',
          icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        }
      ]
    }
  ];

  return (
    <div className={`admin-layout ${isSidebarOpen ? '' : 'sidebar-collapsed'} ${isMobile ? 'mobile-layout' : ''}`}>
      {isMobile && isSidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'collapsed'} ${isMobile ? 'mobile' : ''}`}>
        <div className="admin-logo">
          <Logo size="md" variant="header-light" />
        </div>
        <nav className="admin-nav">
          {navGroups.map((group, groupIdx) => {
            const isExpanded = expandedGroups[group.title];
            return (
              <div key={groupIdx} className="admin-nav-group">
                <div 
                  className="admin-nav-group-title" 
                  onClick={() => toggleGroup(group.title)}
                >
                  <span>{group.title}</span>
                  <svg 
                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`nav-group-chevron ${isExpanded ? 'expanded' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {isExpanded && (
                  <div className="admin-nav-group-items">
                    {group.items.map(item => (
                      <Link 
                        key={item.path} 
                        to={item.path}
                        className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-text">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <div className="admin-header-title" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="admin-icon-btn" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h3>
              {navGroups.flatMap(g => g.items).find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h3>
          </div>
          <div className="admin-header-actions">
            <div style={{ position: 'relative' }}>
              <button 
                className="admin-icon-btn" 
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {notifications.length > 0 && <span className="badge">{notifications.length}</span>}
              </button>
              
              {showNotifications && (
                <div style={{ position: 'absolute', top: '100%', right: 0, width: '320px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', background: 'var(--cream)', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Notifications</div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No new notifications</div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div key={idx} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--maroon)' }}>
                            {notif.notifType === 'restock' ? 'New Waitlist Request!' : 'New Order!'}
                          </span>
                          <span>
                            {notif.notifType === 'restock' 
                              ? notif.message 
                              : `${notif.customerName} placed an order for ₹${notif.totalAmount}`}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="admin-avatar-wrap">
              <img src="https://ui-avatars.com/api/?name=Admin&background=582C36&color=fff" alt="Admin Avatar" className="admin-avatar" />
              <span className="admin-name">Super Admin</span>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
