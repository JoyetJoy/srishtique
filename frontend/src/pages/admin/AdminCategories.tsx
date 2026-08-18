import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState('ORNAMENT');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sizeChart, setSizeChart] = useState('');
  const [sizeChartFile, setSizeChartFile] = useState<File | null>(null);
  const [sizeChartMasterId, setSizeChartMasterId] = useState<string>('');
  const [sizeChartOptions, setSizeChartOptions] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const query = new URLSearchParams({ search, page: page.toString(), limit: limit.toString() });
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        setTotal(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/admin/size-charts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
    }).then(res => res.json()).then(data => {
      if (Array.isArray(data)) setSizeChartOptions(data);
    }).catch(() => {});
  }, []);

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
    setType('ORNAMENT');
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    setImage('');
    setImageFile(null);
    setSizeChart('');
    setSizeChartFile(null);
    setSizeChartMasterId('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setIsEditing(true);
    setCurrentId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setType(category.type || 'ORNAMENT');
    setMetaTitle(category.metaTitle || '');
    setMetaDescription(category.metaDescription || '');
    setMetaKeywords(category.metaKeywords || '');
    setImage(category.image || '');
    setImageFile(null);
    setSizeChart(category.sizeChart || '');
    setSizeChartFile(null);
    setSizeChartMasterId(category.sizeChartMasterId ? category.sizeChartMasterId.toString() : '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalImageUrl = image;
      let finalSizeChartUrl = sizeChart;

      if (sizeChartFile) {
        const fd = new FormData();
        fd.append('image', sizeChartFile);
        fd.append('folder', 'size-charts');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
          body: fd
        });
        const d = await res.json();
        finalSizeChartUrl = d.url;
      }

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('folder', 'categories');

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/admin/categories/${currentId}`
        : `${import.meta.env.VITE_API_URL}/api/admin/categories`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const bodyData: any = { 
        name, slug, image: finalImageUrl, sizeChart: finalSizeChartUrl, 
        sizeChartMasterId: sizeChartMasterId ? Number(sizeChartMasterId) : null,
        type, metaTitle, metaDescription, metaKeywords 
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
        },
        body: JSON.stringify(bodyData)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        toast.success(isEditing ? 'Category updated successfully!' : 'Category created successfully!');
        fetchCategories();
      } else {
        toast.error('Failed to save category');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving category');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = (id: number) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/categories/${categoryToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
        }
      });
      if (res.ok) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        const data = await res.json().catch(() => ({ error: 'Failed to delete category' }));
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error deleting category');
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Categories</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="admin-input" 
            style={{ width: '250px' }}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button className="admin-btn" onClick={openCreateModal}>+ Add Category</button>
        </div>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h4>{isEditing ? 'Edit Category' : 'Create New Category'}</h4>
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
                <label>Type</label>
                <select className="admin-input" value={type} onChange={e => setType(e.target.value)}>
                    <option value="ORNAMENT">Jewellery</option>
                </select>
              </div>
                
              <div className="admin-form-group">
                  <label>Meta Title (SEO)</label>
                  <input type="text" className="admin-input" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="e.g. Best Ethnic Wear..." />
              </div>
                
              <div className="admin-form-group">
                  <label>Meta Description (SEO)</label>
                  <textarea className="admin-input" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} placeholder="A short description for search engines..."></textarea>
              </div>

              <div className="admin-form-group">
                  <label>Meta Keywords / Tags (SEO)</label>
                  <input type="text" className="admin-input" value={metaKeywords} onChange={e => setMetaKeywords(e.target.value)} placeholder="e.g. ethnic wear, silk sarees (comma separated)" />
              </div>

              <div className="admin-form-group">
                <label>Tabular Size Chart Master (optional)</label>
                <select 
                  className="admin-input" 
                  value={sizeChartMasterId} 
                  onChange={e => setSizeChartMasterId(e.target.value)}
                >
                  <option value="">-- None (No Tabular Size Chart) --</option>
                  {sizeChartOptions.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                  ))}
                </select>
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                  Assigning a size chart master will show a clean measurement table on all products in this category.
                </small>
              </div>

              <div className="admin-form-group">
                <label>Image Upload (optional) - Recommended size: 600x600 (Square)</label>
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
                      <img src={getImageUrl(image)} alt="Category Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                      <span style={{fontSize: '10px', color: '#64748b', marginTop: '4px'}}>Current</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn" disabled={uploading}>
                  {uploading ? 'Uploading...' : (isEditing ? 'Save Changes' : 'Create Category')}
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
              <th>Type</th>
              <th>Slug</th>
              <th>Image</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat: any, index: number) => (
              <tr key={cat.id}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{cat.name}</td>
                <td><span style={{ padding: '4px 8px', background: cat.type === 'CLOTHING' ? '#e0e7ff' : '#fef3c7', color: cat.type === 'CLOTHING' ? '#4338ca' : '#d97706', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>{cat.type || 'ORNAMENT'}</span></td>
                <td>{cat.slug}</td>
                <td>{cat.image ? <img src={getImageUrl(cat.image)} alt={cat.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}/> : '-'}</td>
                <td>{cat._count?.products || 0}</td>
                <td>
                    <button className="admin-icon-btn" onClick={() => openEditModal(cat)} aria-label="Edit" title="Edit">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button className="admin-icon-btn admin-icon-btn-danger" onClick={() => confirmDelete(cat.id)} aria-label="Delete" title="Delete">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No categories found</td></tr>
            )}
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
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        onCancel={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={executeDelete}
      />
    </div>
  );
};

export default AdminCategories;
