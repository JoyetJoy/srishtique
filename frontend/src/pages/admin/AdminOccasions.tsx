import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

const AdminOccasions = () => {
  const [occasions, setOccasions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [image, setImage] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchOccasions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/occasions`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOccasions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOccasions();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        const allProds = data.products || data;
        setProducts(allProds.filter((p: any) => p.type === 'CLOTHING' || !p.type));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setSlug('');
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    setImage('');
    setHeroImage('');
    setImageFile(null);
    setHeroImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (occ: any) => {
    setIsEditing(true);
    setCurrentId(occ.id);
    setName(occ.name);
    setSlug(occ.slug);
    setMetaTitle(occ.metaTitle || '');
    setMetaDescription(occ.metaDescription || '');
    setMetaKeywords(occ.metaKeywords || '');
    setImage(occ.image || '');
    setHeroImage(occ.heroImage || '');
    setImageFile(null);
    setHeroImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalImageUrl = image;
      let finalHeroImageUrl = heroImage;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('folder', 'occasions');

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      if (heroImageFile) {
        const formData = new FormData();
        formData.append('image', heroImageFile);
        formData.append('folder', 'occasions');

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        finalHeroImageUrl = uploadData.url;
      }

      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/admin/occasions/${currentId}`
        : `${import.meta.env.VITE_API_URL}/api/admin/occasions`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
        },
        body: JSON.stringify({ name, slug, image: finalImageUrl, heroImage: finalHeroImageUrl, metaTitle, metaDescription, metaKeywords })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        toast.success(isEditing ? 'Occasion updated successfully' : 'Occasion created successfully');
        setIsModalOpen(false);
        fetchOccasions();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save occasion');
      }
    } catch (e) {
      console.error(e);
      toast.error('An error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleAddProductsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/occasions/${currentId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
        },
        body: JSON.stringify({ productIds: selectedProductIds })
      });
      if (res.ok) {
        toast.success('Products added to occasion successfully');
        setIsProductsModalOpen(false);
        fetchOccasions();
      } else {
        toast.error('Failed to add products');
      }
    } catch (e) {
      console.error(e);
      toast.error('An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this occasion?')) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/occasions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
        }
      });
      if (res.ok) {
        toast.success('Occasion deleted successfully');
        fetchOccasions();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete occasion');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error deleting occasion');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Occasions</h2>
        <button className="admin-btn" onClick={openCreateModal}>+ Add Occasion</button>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h4>{isEditing ? 'Edit Occasion' : 'Create New Occasion'}</h4>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={name} 
                  onChange={handleNameChange} 
                  required 
                />
              </div>
              <div className="admin-form-group">
                <label>Slug</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={slug} 
                  onChange={e => setSlug(e.target.value)} 
                  required 
                />
              </div>

              <div className="admin-form-group">
                <label>Meta Title (SEO)</label>
                <input type="text" className="admin-input" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="e.g. Best Ethnic Wear for Occasions..." />
              </div>
              
              <div className="admin-form-group">
                <label>Meta Description (SEO)</label>
                <textarea className="admin-input" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} placeholder="A short description for search engines..."></textarea>
              </div>

              <div className="admin-form-group">
                <label>Meta Keywords / Tags (SEO)</label>
                <input type="text" className="admin-input" value={metaKeywords} onChange={e => setMetaKeywords(e.target.value)} placeholder="e.g. wedding wear, festive kurtis (comma separated)" />
              </div>

              <div className="admin-form-group">
                <label>Grid Image Upload (optional) - Recommended size: 600x600 (Square)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      className="admin-input" 
                      accept="image/*"
                      onChange={e => setImageFile(e.target.files?.[0] || null)} 
                    />
                  </div>
                  {image && !imageFile && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={getImageUrl(image)} alt="Grid Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                      <span style={{fontSize: '10px', color: '#64748b', marginTop: '4px'}}>Current</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label>Hero Banner Image Upload (optional) - Best size: 1920x400</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="file" 
                      className="admin-input" 
                      accept="image/*"
                      onChange={e => setHeroImageFile(e.target.files?.[0] || null)} 
                    />
                  </div>
                  {heroImage && !heroImageFile && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <img src={getImageUrl(heroImage)} alt="Hero Preview" style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                      <span style={{fontSize: '10px', color: '#64748b', marginTop: '4px'}}>Current</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn" disabled={uploading}>
                  {uploading ? 'Uploading...' : (isEditing ? 'Save Changes' : 'Create Occasion')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Products Modal */}
      {isProductsModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsProductsModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90vw' }}>
            <div className="admin-modal-header">
              <h4>Add Products to Occasion</h4>
              <button className="admin-modal-close" onClick={() => setIsProductsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddProductsSubmit}>
              <div className="admin-form-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '0 4px' }}>
                  <input 
                    type="checkbox" 
                    id="selectAllOccasion"
                    checked={products.length > 0 && products.every(p => selectedProductIds.includes(p.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newIds = new Set([...selectedProductIds, ...products.map(p => p.id)]);
                        setSelectedProductIds(Array.from(newIds));
                      } else {
                        const productIds = products.map(p => p.id);
                        setSelectedProductIds(selectedProductIds.filter(id => !productIds.includes(id)));
                      }
                    }}
                  />
                  <label htmlFor="selectAllOccasion" style={{ fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Select All</label>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '4px', padding: '12px' }}>
                  {products.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
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
                      <span style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0, paddingRight: '12px' }}>₹{p.variants?.[0]?.price || 'N/A'}</span>
                    </label>
                  ))}
                  {products.length === 0 && <div style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>No products available</div>}
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsProductsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn" disabled={selectedProductIds.length === 0}>
                  Add Selected ({selectedProductIds.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>S.NO</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Grid Image</th>
              <th>Hero Image</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {occasions.map((occ: any, index: number) => (
              <tr key={occ.id}>
                <td>{index + 1}</td>
                <td style={{ fontWeight: 600 }}>{occ.name}</td>
                <td>{occ.slug}</td>
                <td>{occ.image ? <img src={getImageUrl(occ.image)} alt={occ.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}/> : '-'}</td>
                <td>{occ.heroImage ? <img src={getImageUrl(occ.heroImage)} alt={occ.name} style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}/> : '-'}</td>
                <td>{occ._count?.products || 0}</td>
                <td>
                  <button 
                    className="admin-btn-secondary"
                    onClick={() => {
                      setCurrentId(occ.id);
                      setSelectedProductIds([]);
                      setIsProductsModalOpen(true);
                    }}
                    style={{ marginRight: '8px' }}
                  >
                    Add Products
                  </button>
                  <button 
                    onClick={() => openEditModal(occ)} 
                    style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(occ.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {occasions.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>No occasions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOccasions;
