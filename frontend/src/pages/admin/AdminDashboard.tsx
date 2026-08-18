import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [dateOffset, setDateOffset] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let url = `${import.meta.env.VITE_API_URL}/api/admin/dashboard-stats?range=${timeRange}`;
        if (timeRange === 'custom') {
          url += `&start=${customStart}&end=${customEnd}`;
        } else {
          url += `&offset=${dateOffset}`;
        }
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
        });
        if (res.ok) {
          const statsData = await res.json();
          setData(statsData);
        } else {
          toast.error('Failed to load dashboard stats');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [timeRange, customStart, customEnd, dateOffset]);

  if (loading && !data) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', color: '#64748b' }}>Loading Dashboard...</div>;
  }

  const { 
    periodLabel = '', 
    stats = [], 
    revenueData = [], 
    categoryData = [], 
    orderStatusData = [], 
    lowStockItems = [], 
    recentCustomers = [], 
    recentOrders = [] 
  } = data || {};

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Dashboard Overview</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {timeRange === 'custom' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="date" 
                className="admin-input" 
                style={{ padding: '6px 12px' }}
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <span style={{ color: '#64748b', alignSelf: 'center' }}>to</span>
              <input 
                type="date" 
                className="admin-input" 
                style={{ padding: '6px 12px' }}
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          )}

          {timeRange !== 'custom' && timeRange !== 'all_time' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px' }}>
              <button 
                onClick={() => setDateOffset(prev => prev - 1)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', color: '#475569', fontWeight: 'bold' }}
              >
                &lt;
              </button>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#334155', minWidth: '100px', textAlign: 'center' }}>
                {periodLabel || 'Loading...'}
              </span>
              <button 
                onClick={() => setDateOffset(prev => prev + 1)}
                disabled={dateOffset >= 0}
                style={{ background: 'transparent', border: 'none', cursor: dateOffset >= 0 ? 'not-allowed' : 'pointer', padding: '4px 8px', borderRadius: '4px', color: dateOffset >= 0 ? '#cbd5e1' : '#475569', fontWeight: 'bold' }}
              >
                &gt;
              </button>
            </div>
          )}

          <select 
            className="admin-input" 
            style={{ width: '160px', padding: '8px 12px' }}
            value={timeRange} 
            onChange={(e) => {
              setTimeRange(e.target.value);
              setDateOffset(0);
            }}
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {stats.map((stat: any, i: number) => (
          <div key={i} className="admin-card stat-card" style={{ marginBottom: 0, animationDelay: `${i * 0.1}s` }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>{stat.label}</h4>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>{stat.value}</h2>
              {stat.trend && (
                <span style={{ fontSize: '13px', fontWeight: 600, color: stat.isPositive ? '#10b981' : '#ef4444' }}>
                  {stat.trend}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Revenue Chart */}
        <div className="admin-card" style={{ marginBottom: 0, animationDelay: '0.4s' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--maroon)' }}>Revenue Overview (Last 7 Months)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--maroon)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--maroon)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--maroon)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Category Chart */}
        <div className="admin-card" style={{ marginBottom: 0, animationDelay: '0.5s' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--maroon)' }}>Top Categories (Orders)</h3>
          <div style={{ height: '300px', width: '100%' }}>
            {categoryData && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={80} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: 'var(--pink-bg)' }}
                  />
                  <Bar dataKey="orders" fill="var(--maroon)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                No category data yet
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '32px' }}>
        {/* Order Status Chart */}
        <div className="admin-card" style={{ marginBottom: 0, animationDelay: '0.6s' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--maroon)' }}>Order Status Breakdown</h3>
          <div style={{ height: '300px', width: '100%' }}>
            {orderStatusData && orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {orderStatusData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                No status data yet
              </div>
            )}
          </div>
          {orderStatusData && orderStatusData.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
              {orderStatusData.map((entry: any, index: number) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-card" style={{ marginBottom: 0, animationDelay: '0.7s' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
            Low Stock Alerts
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems && lowStockItems.length > 0 ? (
                  lowStockItems.map((item: any) => (
                    <tr key={item.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.image && <img src={getImageUrl(item.image)} alt={item.productName} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />}
                        <span style={{ fontWeight: 500, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{item.productName}</span>
                      </td>
                      <td style={{ color: '#64748b' }}>{item.variantInfo}</td>
                      <td>
                        <span style={{ 
                          background: '#fee2e2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 
                        }}>
                          {item.stock} left
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No low stock items.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="admin-card" style={{ animationDelay: '0.8s' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--maroon)' }}>Recent Orders</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500 }}>#ORD-{order.id}</td>
                    <td>{order.customerName}</td>
                    <td style={{ color: '#64748b' }}>{new Date(order.date).toLocaleDateString()}</td>
                    <td>
                      <span style={{ 
                        background: order.status === 'DELIVERED' ? '#dcfce7' : 
                                    order.status === 'PENDING' ? '#fef3c7' : 
                                    order.status === 'CANCELLED' ? '#fee2e2' : '#f3e8ff', 
                        color: order.status === 'DELIVERED' ? '#166534' : 
                               order.status === 'PENDING' ? '#92400e' : 
                               order.status === 'CANCELLED' ? '#991b1b' : '#6b21a8', 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{order.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No recent orders.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

        {/* Recent Customers */}
        <div className="admin-card" style={{ animationDelay: '0.9s' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--maroon)' }}>Recent Customers</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers && recentCustomers.length > 0 ? (
                  recentCustomers.map((user: any, idx: number) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{user.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>{new Date(user.date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No recent customers.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
