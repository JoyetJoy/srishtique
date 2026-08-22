import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

interface Props {
  type: 'trending' | 'new-arrivals';
  title: string;
}

const AdminCollectionManager = ({ type, title }: Props) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products?limit=1000`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentProducts = Array.isArray(products) ? products.filter(p => p[type === 'trending' ? 'isTrending' : 'isNewArrival']) : [];
  const displayProducts = currentProducts;

  const openModal = () => {
    setSelectedProductIds(currentProducts.map(p => p.id));
    setSearchTerm('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = type === 'trending' ? '/api/admin/products/trending' : '/api/admin/products/new-arrivals';
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
        },
        body: JSON.stringify({ productIds: selectedProductIds })
      });

      if (res.ok) {
        toast.success(`${title} updated successfully`);
        fetchProducts();
        setIsModalOpen(false);
      } else {
        toast.error(`Failed to update ${title}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating products');
    }
  };

  const filteredSearchProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>{title}</h2>
        <button className="admin-btn" onClick={openModal}>Manage Products</button>
      </div>



      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.NO</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.images?.[0] ? <img src={getImageUrl(p.images[0])} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}/> : '-'}</td>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td>{p.category?.name || '-'}</td>
                <td>₹{p.variants?.[0]?.price || 'N/A'}</td>
              </tr>
            ))}
            {displayProducts.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>No products in {title}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90vw' }}>
            <div className="admin-modal-header">
              <h4>Manage {title}</h4>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="admin-form-group">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="admin-input"
                  style={{ marginBottom: '16px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '0 4px' }}>
                  <input 
                    type="checkbox" 
                    id="selectAll"
                    checked={filteredSearchProducts.length > 0 && filteredSearchProducts.every(p => selectedProductIds.includes(p.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newIds = new Set([...selectedProductIds, ...filteredSearchProducts.map(p => p.id)]);
                        setSelectedProductIds(Array.from(newIds));
                      } else {
                        const filteredIds = filteredSearchProducts.map(p => p.id);
                        setSelectedProductIds(selectedProductIds.filter(id => !filteredIds.includes(id)));
                      }
                    }}
                  />
                  <label htmlFor="selectAll" style={{ fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Select All</label>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                  {filteredSearchProducts.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedProductIds.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProductIds([...selectedProductIds, p.id]);
                          } else {
                            setSelectedProductIds(selectedProductIds.filter(id => id !== p.id));
                          }
                        }}
                      />
                      <img src={getImageUrl(p.images?.[0])} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                      <span style={{ fontSize: '14px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                      <span style={{ fontSize: '13px', color: '#64748b', flexShrink: 0, paddingRight: '12px' }}>₹{p.variants?.[0]?.price || 'N/A'}</span>
                    </label>
                  ))}
                  {filteredSearchProducts.length === 0 && <div style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>No products found</div>}
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn">Save Selection ({filteredSearchProducts.filter(p => selectedProductIds.includes(p.id)).length})</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollectionManager;
