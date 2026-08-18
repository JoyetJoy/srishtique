import { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/imageUrl';
import toast from 'react-hot-toast';
import './AdminTestimonials.css';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [productImg, setProductImg] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/testimonials`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setRating(5);
    setText('');
    setProductImg('');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setIsEditing(true);
    setCurrentId(t.id);
    setName(t.name);
    setRating(t.rating);
    setText(t.text);
    setProductImg(t.productImg || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalImageUrl = productImg;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('folder', 'testimonials');

        const uploadRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }

      const url = isEditing 
        ? `${import.meta.env.VITE_API_URL}/api/admin/testimonials/${currentId}`
        : `${import.meta.env.VITE_API_URL}/api/admin/testimonials`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
        },
        body: JSON.stringify({ name, rating, text, productImg: finalImageUrl })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        toast.success(isEditing ? 'Testimonial updated successfully!' : 'Testimonial created successfully!');
        fetchTestimonials();
      } else {
        toast.error('Failed to save testimonial');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving testimonial');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
        }
      });
      if (res.ok) {
        toast.success('Testimonial deleted successfully!');
        fetchTestimonials();
      } else {
        toast.error('Failed to delete testimonial');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error deleting testimonial');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Testimonials</h2>
        <button className="admin-btn" onClick={openCreateModal}>+ Add Testimonial</button>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h4>{isEditing ? 'Edit Testimonial' : 'Create New Testimonial'}</h4>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Reviewer Name</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="admin-form-group">
                <label>Rating (1-5)</label>
                <input 
                  type="number" 
                  className="admin-input" 
                  value={rating}
                  min="1"
                  max="5"
                  onChange={e => setRating(parseInt(e.target.value))} 
                  required 
                />
              </div>
              <div className="admin-form-group">
                <label>Review Text</label>
                <textarea 
                  className="admin-input" 
                  value={text} 
                  onChange={e => setText(e.target.value)} 
                  required 
                  rows={4}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn" disabled={uploading}>
                  {uploading ? 'Uploading...' : (isEditing ? 'Save Changes' : 'Create Testimonial')}
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
              <th>Rating</th>
              <th>Text</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t: any, index: number) => (
              <tr key={t.id}>
                <td>{index + 1}</td>
                <td>{t.name}</td>
                <td>{t.rating} ★</td>
                <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.text}</td>
                <td>{t.productImg ? <img src={getImageUrl(t.productImg)} alt="Product" style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '3px' }}/> : '-'}</td>
                <td>
                  <button 
                    onClick={() => openEditModal(t)} 
                    style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '12px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No testimonials found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTestimonials;
