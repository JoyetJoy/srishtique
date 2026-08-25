import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!search) {
      fetchCustomers();
      return;
    }
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const fetchCustomers = async () => {
    try {
      const query = new URLSearchParams({ search, page: page.toString(), limit: limit.toString() });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/customers?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Customers</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search name, email, phone..." 
            className="admin-input" 
            style={{ width: '300px' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <p>Loading customers...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any, index: number) => (
                <tr key={c.id}>
                  <td>{(page - 1) * limit + index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{c.name || '-'}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c._count?.orders || 0}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="admin-btn-secondary" 
                      onClick={() => navigate(`/admin/customers/${c.id}`)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', gap: '8px' }}>
          <button 
            className="admin-btn-secondary" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 600 }}>
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button 
            className="admin-btn-secondary"
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
