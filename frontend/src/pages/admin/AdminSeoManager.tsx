import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface StaticSeo {
  id: number;
  pagePath: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
}

const AdminSeoManager = () => {
  const token = localStorage.getItem('dk_exporting_token');
  const [seoList, setSeoList] = useState<StaticSeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [editForm, setEditForm] = useState({
    pagePath: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: ''
  });

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchSeo();
  }, [token]);

  const fetchSeo = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/seo/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSeoList(data);
      }
    } catch (error) {
      toast.error('Failed to load SEO data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (seo: StaticSeo) => {
    setEditingId(seo.id);
    setEditForm({
      pagePath: seo.pagePath,
      metaTitle: seo.metaTitle || '',
      metaDescription: seo.metaDescription || '',
      metaKeywords: seo.metaKeywords || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm({ pagePath: '', metaTitle: '', metaDescription: '', metaKeywords: '' });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/seo/admin/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(editForm)
        });
        toast.success('SEO updated successfully');
      } else {
        await fetch(`${import.meta.env.VITE_API_URL || ''}/api/seo/admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(editForm)
        });
        toast.success('SEO created successfully');
      }
      handleCancel();
      fetchSeo();
    } catch (error) {
      toast.error('Failed to save SEO data');
    }
  };

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading SEO data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>SEO Manager</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>Manage Meta Titles, Descriptions, and Keywords for static pages</p>
        </div>
        <button className="admin-btn" onClick={() => setIsAdding(true)}>
          + Add Page SEO
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page Path</th>
              <th>Meta Title</th>
              <th>Meta Description</th>
              <th>Meta Keywords</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <td style={{ padding: '12px' }}>
                  <input
                    type="text"
                    value={editForm.pagePath}
                    onChange={(e) => setEditForm({ ...editForm, pagePath: e.target.value })}
                    placeholder="e.g. /clothes"
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <input
                    type="text"
                    value={editForm.metaTitle}
                    onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })}
                    placeholder="Title"
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <input
                    type="text"
                    value={editForm.metaDescription}
                    onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                    placeholder="Description"
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <input
                    type="text"
                    value={editForm.metaKeywords}
                    onChange={(e) => setEditForm({ ...editForm, metaKeywords: e.target.value })}
                    placeholder="Keywords (comma separated)"
                    className="admin-input"
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={handleSave}
                      style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleCancel}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {seoList.map((seo) => (
              <tr key={seo.id}>
                {editingId === seo.id ? (
                  <>
                    <td style={{ padding: '12px', backgroundColor: '#f8fafc' }}>
                      <input
                        type="text"
                        value={editForm.pagePath}
                        onChange={(e) => setEditForm({ ...editForm, pagePath: e.target.value })}
                        className="admin-input"
                        style={{ marginBottom: 0 }}
                      />
                    </td>
                    <td style={{ padding: '12px', backgroundColor: '#f8fafc' }}>
                      <input
                        type="text"
                        value={editForm.metaTitle}
                        onChange={(e) => setEditForm({ ...editForm, metaTitle: e.target.value })}
                        className="admin-input"
                        style={{ marginBottom: 0 }}
                      />
                    </td>
                    <td style={{ padding: '12px', backgroundColor: '#f8fafc' }}>
                      <input
                        type="text"
                        value={editForm.metaDescription}
                        onChange={(e) => setEditForm({ ...editForm, metaDescription: e.target.value })}
                        className="admin-input"
                        style={{ marginBottom: 0 }}
                      />
                    </td>
                    <td style={{ padding: '12px', backgroundColor: '#f8fafc' }}>
                      <input
                        type="text"
                        value={editForm.metaKeywords}
                        onChange={(e) => setEditForm({ ...editForm, metaKeywords: e.target.value })}
                        className="admin-input"
                        style={{ marginBottom: 0 }}
                      />
                    </td>
                    <td style={{ padding: '12px', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                          onClick={handleSave}
                          style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancel}
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{seo.pagePath}</td>
                    <td style={{ color: '#475569' }}>{seo.metaTitle || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Default</span>}</td>
                    <td style={{ color: '#475569', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {seo.metaDescription || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Default</span>}
                    </td>
                    <td style={{ color: '#475569', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {seo.metaKeywords || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Default</span>}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleEdit(seo)}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {seoList.length === 0 && !isAdding && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                  No custom SEO records found. Add one above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSeoManager;
