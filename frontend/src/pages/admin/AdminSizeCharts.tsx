import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

interface SizeChartSection {
  title: string;
  headers: string[];
  rows: Record<string, string>[];
}

interface SizeChartMaster {
  id: number;
  name: string;
  data: SizeChartSection[];
  _count?: {
    categories: number;
    products: number;
  };
  createdAt: string;
}

const DEFAULT_SECTION: SizeChartSection = {
  title: 'TOP SIZE',
  headers: ['Size', 'Bust', 'Waist', 'Hip', 'Length'],
  rows: [
    { Size: 'S', Bust: '37', Waist: '34', Hip: '39', Length: '45' },
    { Size: 'M', Bust: '39', Waist: '36', Hip: '41', Length: '46' },
    { Size: 'L', Bust: '41', Waist: '38', Hip: '43', Length: '46' },
    { Size: 'XL', Bust: '43', Waist: '40', Hip: '45', Length: '47' },
    { Size: 'XXL', Bust: '45', Waist: '42', Hip: '47', Length: '47' },
    { Size: 'XXXL', Bust: '47', Waist: '44', Hip: '49', Length: '48' }
  ]
};

const DEFAULT_BOTTOM_SECTION: SizeChartSection = {
  title: 'BOTTOM SIZE',
  headers: ['Size', 'Waist', 'Length'],
  rows: [
    { Size: 'S', Waist: '24', Length: '37' },
    { Size: 'M', Waist: '25', Length: '39-40' },
    { Size: 'L', Waist: '26', Length: '39-40' },
    { Size: 'XL', Waist: '27', Length: '39-40' },
    { Size: 'XXL', Waist: '27 (29)', Length: '39-40' },
    { Size: 'XXXL', Waist: '31', Length: '39-40' }
  ]
};

const AdminSizeCharts: React.FC = () => {
  const [sizeCharts, setSizeCharts] = useState<SizeChartMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [sections, setSections] = useState<SizeChartSection[]>([JSON.parse(JSON.stringify(DEFAULT_SECTION))]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<number | null>(null);

  // Add Column Modal State
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const [targetSectionIdx, setTargetSectionIdx] = useState<number | null>(null);
  const [newColName, setNewColName] = useState('');

  const fetchSizeCharts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/size-charts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSizeCharts(data);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load size charts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizeCharts();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setSections([JSON.parse(JSON.stringify(DEFAULT_SECTION))]);
    setIsModalOpen(true);
  };

  const openEditModal = (chart: SizeChartMaster) => {
    setIsEditing(true);
    setCurrentId(chart.id);
    setName(chart.name);
    try {
      const parsedData = typeof chart.data === 'string' ? JSON.parse(chart.data) : chart.data;
      setSections(Array.isArray(parsedData) && parsedData.length > 0 ? parsedData : [JSON.parse(JSON.stringify(DEFAULT_SECTION))]);
    } catch {
      setSections([JSON.parse(JSON.stringify(DEFAULT_SECTION))]);
    }
    setIsModalOpen(true);
  };

  const handleApplyPresetCombo = () => {
    setSections([
      JSON.parse(JSON.stringify(DEFAULT_SECTION)),
      JSON.parse(JSON.stringify(DEFAULT_BOTTOM_SECTION))
    ]);
    toast.success('Applied Top & Bottom combo preset!');
  };

  // Section manipulators
  const handleAddSection = () => {
    setSections([...sections, { title: 'NEW SECTION', headers: ['Size', 'Chest', 'Length'], rows: [{ Size: 'S', Chest: '38', Length: '28' }] }]);
  };

  const handleRemoveSection = (sectionIndex: number) => {
    if (sections.length === 1) {
      toast.error('At least one section is required');
      return;
    }
    setSections(sections.filter((_, idx) => idx !== sectionIndex));
  };

  const handleUpdateSectionTitle = (sectionIndex: number, title: string) => {
    const updated = [...sections];
    updated[sectionIndex].title = title;
    setSections(updated);
  };

  // Column Modal Handlers
  const openAddColumnModal = (sectionIndex: number) => {
    setTargetSectionIdx(sectionIndex);
    setNewColName('');
    setColumnModalOpen(true);
  };

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetSectionIdx === null) return;
    const cleanHeader = newColName.trim();
    if (!cleanHeader) {
      toast.error('Column name is required');
      return;
    }
    const updated = [...sections];
    const section = updated[targetSectionIdx];
    if (section.headers.some(h => h.toLowerCase() === cleanHeader.toLowerCase())) {
      toast.error('Column name already exists in this section');
      return;
    }
    section.headers.push(cleanHeader);
    section.rows = section.rows.map(row => ({ ...row, [cleanHeader]: '' }));
    setSections(updated);
    setColumnModalOpen(false);
    setTargetSectionIdx(null);
    setNewColName('');
    toast.success(`Column "${cleanHeader}" added!`);
  };

  const handleRemoveHeader = (sectionIndex: number, headerIndex: number) => {
    const updated = [...sections];
    const section = updated[sectionIndex];
    if (section.headers.length <= 1) {
      toast.error('At least one column is required');
      return;
    }
    const removedHeader = section.headers[headerIndex];
    section.headers.splice(headerIndex, 1);
    section.rows = section.rows.map(row => {
      const copy = { ...row };
      delete copy[removedHeader];
      return copy;
    });
    setSections(updated);
  };

  // Row manipulators
  const handleAddRow = (sectionIndex: number) => {
    const updated = [...sections];
    const section = updated[sectionIndex];
    const newRow: Record<string, string> = {};
    section.headers.forEach(h => {
      newRow[h] = '';
    });
    section.rows.push(newRow);
    setSections(updated);
  };

  const handleRemoveRow = (sectionIndex: number, rowIndex: number) => {
    const updated = [...sections];
    const section = updated[sectionIndex];
    if (section.rows.length <= 1) {
      toast.error('At least one row is required');
      return;
    }
    section.rows.splice(rowIndex, 1);
    setSections(updated);
  };

  const handleCellChange = (sectionIndex: number, rowIndex: number, header: string, value: string) => {
    const updated = [...sections];
    updated[sectionIndex].rows[rowIndex][header] = value;
    setSections(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Size chart name is required');
      return;
    }

    try {
      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/admin/size-charts/${currentId}`
        : `${import.meta.env.VITE_API_URL}/api/admin/size-charts`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}`
        },
        body: JSON.stringify({ name: name.trim(), data: sections })
      });

      if (res.ok) {
        toast.success(`Size chart ${isEditing ? 'updated' : 'created'} successfully!`);
        setIsModalOpen(false);
        fetchSizeCharts();
      } else {
        toast.error('Failed to save size chart');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving size chart');
    }
  };

  const handleDelete = async () => {
    if (!chartToDelete) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/size-charts/${chartToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dk_exporting_token')}` }
      });
      if (res.ok) {
        toast.success('Size chart deleted successfully');
        fetchSizeCharts();
      } else {
        toast.error('Failed to delete size chart');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error deleting size chart');
    } finally {
      setDeleteModalOpen(false);
      setChartToDelete(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Size Chart Masters</h2>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Create reusable tabular size charts and assign them to categories or products.
          </p>
        </div>
        <button className="admin-btn" onClick={openCreateModal}>
          + Create Size Chart
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading size charts...</div>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Sections</th>
                <th>Assigned Categories</th>
                <th>Assigned Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sizeCharts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No size charts found. Click "+ Create Size Chart" to add one.
                  </td>
                </tr>
              ) : (
                sizeCharts.map((chart) => (
                  <tr key={chart.id}>
                    <td>#{chart.id}</td>
                    <td><strong>{chart.name}</strong></td>
                    <td>
                      {Array.isArray(chart.data)
                        ? chart.data.map((s: any) => s.title).join(', ')
                        : '1 Section'}
                    </td>
                    <td>{chart._count?.categories || 0} Categories</td>
                    <td>{chart._count?.products || 0} Products</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="admin-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => openEditModal(chart)}>Edit</button>
                        <button className="admin-btn" style={{ padding: '6px 12px', fontSize: '13px', background: '#ef4444' }} onClick={() => { setChartToDelete(chart.id); setDeleteModalOpen(true); }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '90%' }}>
            <div className="admin-modal-header">
              <h4>{isEditing ? 'Edit Size Chart Master' : 'Create New Size Chart Master'}</h4>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Size Chart Master Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Women's Kurtas & Bottoms - Regular Fit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
                  Use a descriptive name like "Women's Kurtas - Regular Fit" so you can identify it easily in dropdowns.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-mid)' }}>Presets:</span>
                <button type="button" className="admin-btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={handleApplyPresetCombo}>
                  Apply Top & Bottom Combo Preset
                </button>
                <button type="button" className="admin-btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={handleAddSection}>
                  + Add New Section
                </button>
              </div>

              {/* SECTIONS EDITOR */}
              {sections.map((section, sIdx) => (
                <div key={sIdx} style={{ background: 'var(--pink-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <label style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-mid)', margin: 0 }}>Section Title:</label>
                      <input
                        type="text"
                        className="admin-input"
                        style={{ maxWidth: '250px', fontWeight: 'bold', background: '#fff' }}
                        value={section.title}
                        onChange={(e) => handleUpdateSectionTitle(sIdx, e.target.value)}
                        placeholder="e.g. TOP SIZE or BOTTOM SIZE"
                      />
                    </div>
                    <button type="button" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }} onClick={() => handleRemoveSection(sIdx)}>
                      Remove Section
                    </button>
                  </div>

                  {/* TABLE CONTROLS */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button type="button" className="admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', background: '#fff' }} onClick={() => openAddColumnModal(sIdx)}>
                      + Add Column
                    </button>
                    <button type="button" className="admin-btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', background: '#fff' }} onClick={() => handleAddRow(sIdx)}>
                      + Add Row
                    </button>
                  </div>

                  {/* DYNAMIC TABLE EDITOR */}
                  <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          {section.headers.map((h, hIdx) => (
                            <th key={hIdx} style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'center', position: 'relative' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <span>{h}</span>
                                {section.headers.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveHeader(sIdx, hIdx)}
                                    style={{ color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}
                                    title="Remove Column"
                                  >
                                    &times;
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                          <th style={{ padding: '8px', border: '1px solid #e2e8f0', width: '50px', textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {section.headers.map((h, hIdx) => (
                              <td key={hIdx} style={{ padding: '4px', border: '1px solid #e2e8f0' }}>
                                <input
                                  type="text"
                                  style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontSize: '13px' }}
                                  value={row[h] || ''}
                                  onChange={(e) => handleCellChange(sIdx, rIdx, h, e.target.value)}
                                />
                              </td>
                            ))}
                            <td style={{ padding: '4px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(sIdx, rIdx)}
                                style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                title="Delete Row"
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* PREVIEW BOX */}
              <div style={{ marginTop: '20px', borderTop: '2px dashed var(--border)', paddingTop: '15px' }}>
                <h5 style={{ marginBottom: '10px', color: 'var(--maroon)', fontSize: '14px' }}>Live Store Customer Preview:</h5>
                <div style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px', fontFamily: 'sans-serif', overflowX: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  {sections.map((sec, idx) => (
                    <div key={idx} style={{ marginBottom: idx < sections.length - 1 ? '24px' : '0' }}>
                      {sec.title && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '2px solid var(--pink-light)', paddingBottom: '6px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', color: 'var(--maroon)' }}>
                            {sec.title.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', fontStyle: 'italic' }}>
                            *All measurements in inches
                          </span>
                        </div>
                      )}
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: 'fixed' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            {sec.headers.map((h, hIdx) => (
                              <th 
                                key={hIdx} 
                                style={{ 
                                  padding: '10px 6px', 
                                  fontWeight: '600', 
                                  color: '#475569', 
                                  textAlign: hIdx === 0 ? 'left' : 'center',
                                  fontSize: '12px',
                                  letterSpacing: '0.5px'
                                }}
                              >
                                {h.toUpperCase()}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sec.rows.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: rIdx < sec.rows.length - 1 ? '1px solid #f1f5f9' : 'none', background: rIdx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                              {sec.headers.map((h, hIdx) => (
                                <td 
                                  key={hIdx} 
                                  style={{ 
                                    padding: '10px 6px', 
                                    color: hIdx === 0 ? '#0f172a' : '#334155', 
                                    fontWeight: hIdx === 0 ? '600' : 'normal', 
                                    textAlign: hIdx === 0 ? 'left' : 'center',
                                    fontSize: '13px'
                                  }}
                                >
                                  {row[h] !== undefined && row[h] !== '' ? row[h] : (hIdx === 0 ? row['Size'] || row['size'] || '' : '-')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn">
                  {isEditing ? 'Save Changes' : 'Create Size Chart'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COLUMN MODAL */}
      {columnModalOpen && (
        <div className="admin-modal-overlay" onClick={() => setColumnModalOpen(false)} style={{ zIndex: 1100 }}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', width: '90%' }}>
            <div className="admin-modal-header">
              <h4>Add New Column</h4>
              <button type="button" className="admin-modal-close" onClick={() => setColumnModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddColumnSubmit}>
              <div className="admin-form-group">
                <label>Column Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Shoulder, Sleeve, Inseam"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="admin-form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setColumnModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn">Add Column</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Size Chart Master"
        message="Are you sure you want to delete this size chart? Categories or products assigned to it will revert to their default."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default AdminSizeCharts;
