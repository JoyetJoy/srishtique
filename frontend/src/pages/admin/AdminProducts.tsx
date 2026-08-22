import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const limit = 10;
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, type]);

  const fetchProducts = async () => {
    try {
      const query = new URLSearchParams({ search, page: page.toString(), limit: limit.toString(), type });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products?${query.toString()}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` } });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
      }
    } catch (e) { console.error(e); }
  };

  const confirmDelete = (id: number) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products/${productToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      }
      else toast.error('Failed to delete product');
    } catch (e) {
      console.error(e);
      toast.error('Error deleting product');
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Products</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            className="admin-input" 
            style={{ width: '250px' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="admin-btn" onClick={() => navigate('/admin/products/new')}>+ Add Product</button>
        </div>
      </div>



      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.NO</th>
              <th>Image</th>
              <th>Name</th>
              <th>Status</th>
              <th>Variants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any, index: number) => (
              <tr key={p.id}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{p.images?.[0] && <img src={getImageUrl(p.images[0])} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}</td>
                <td>{p.name}</td>
                <td>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                    <input 
                      type="checkbox" 
                      checked={p.isActive}
                      onChange={async (e) => {
                        try {
                          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products/${p.id}/status`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
                            },
                            body: JSON.stringify({ isActive: e.target.checked })
                          });
                          if (res.ok) {
                            fetchProducts();
                            toast.success(`Product ${e.target.checked ? 'activated' : 'deactivated'}`);
                          } else {
                            toast.error('Failed to update product status');
                          }
                        } catch (err) {
                          toast.error('Error updating product status');
                        }
                      }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{ 
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                      backgroundColor: p.isActive ? '#10b981' : '#cbd5e1', 
                      transition: '.4s', borderRadius: '34px' 
                    }}>
                      <span style={{ 
                        position: 'absolute', content: '""', height: '16px', width: '16px', 
                        left: p.isActive ? '22px' : '2px', bottom: '2px', backgroundColor: 'white', 
                        transition: '.4s', borderRadius: '50%' 
                      }}></span>
                    </span>
                  </label>
                </td>
                <td>{p.variants?.length || 0}</td>
                <td>
                  <button 
                    onClick={() => navigate(`/admin/products/edit/${p.id}`)} 
                    style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => confirmDelete(p.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6}>No products found</td></tr>}
          </tbody>
        </table>
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

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        onConfirm={executeDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminProducts;
