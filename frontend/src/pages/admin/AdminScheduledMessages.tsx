import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Send, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface ScheduledMessage {
  id: number;
  title: string;
  message: string;
  imageUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  scheduledAt: string;
  status: string;
  targetType: string;
  sentCount: number;
  failedCount: number;
  createdAt: string;
}

const AdminScheduledMessages = () => {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    imageUrl: '',
    buttonLabel: '',
    buttonUrl: '',
    scheduledAt: '',
    targetType: 'ALL_LINKED',
  });

  const token = localStorage.getItem('dk_exporting_token');

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/scheduled-messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleCreate = async () => {
    if (!formData.title || !formData.message || !formData.scheduledAt) {
      toast.error('Title, message, and schedule time are required');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/scheduled-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Message scheduled');
        setShowForm(false);
        setFormData({ title: '', message: '', imageUrl: '', buttonLabel: '', buttonUrl: '', scheduledAt: '', targetType: 'ALL_LINKED' });
        fetchMessages();
      } else {
        toast.error('Failed to create message');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/scheduled-messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Deleted');
        fetchMessages();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSendNow = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/scheduled-messages/${id}/send-now`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Message queued for immediate sending');
        fetchMessages();
      }
    } catch (err) {
      toast.error('Failed to send');
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      PENDING: { bg: '#fef3c7', color: '#92400e' },
      SENDING: { bg: '#dbeafe', color: '#1e40af' },
      SENT: { bg: '#d1fae5', color: '#065f46' },
      FAILED: { bg: '#fee2e2', color: '#991b1b' },
    };
    const s = styles[status] || styles.PENDING;
    return (
      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: s.bg, color: s.color }}>
        {status}
      </span>
    );
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Scheduled Messages</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--maroon)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
        >
          <Plus size={16} /> New Message
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ marginTop: 0 }}>Create Scheduled Message</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <input placeholder="Title (internal)" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            <textarea placeholder="Message (HTML supported)" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={4} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontFamily: 'inherit' }} />
            <input placeholder="Image URL (optional)" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input placeholder="Button Label (optional)" value={formData.buttonLabel} onChange={e => setFormData({ ...formData, buttonLabel: e.target.value })} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              <input placeholder="Button URL (optional)" value={formData.buttonUrl} onChange={e => setFormData({ ...formData, buttonUrl: e.target.value })} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>Schedule Date & Time</label>
                <input type="datetime-local" value={formData.scheduledAt} onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>Target</label>
                <select value={formData.targetType} onChange={e => setFormData({ ...formData, targetType: e.target.value })} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%' }}>
                  <option value="ALL_LINKED">All Linked Users</option>
                  <option value="SPECIFIC_CHAT">Specific Chat (Test)</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleCreate} style={{ padding: '10px 20px', background: 'var(--maroon)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Schedule</button>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>No scheduled messages yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong>{msg.title}</strong>
                  {statusBadge(msg.status)}
                </div>
                <p style={{ margin: '4px 0', color: '#374151', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{msg.message.slice(0, 200)}{msg.message.length > 200 ? '...' : ''}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                  <span><Clock size={12} /> {new Date(msg.scheduledAt).toLocaleString()}</span>
                  <span>Sent: {msg.sentCount}</span>
                  <span>Failed: {msg.failedCount}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {msg.status === 'PENDING' && (
                  <button onClick={() => handleSendNow(msg.id)} title="Send Now" style={{ padding: '6px', background: '#dbeafe', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#1e40af' }}>
                    <Send size={14} />
                  </button>
                )}
                <button onClick={() => handleDelete(msg.id)} title="Delete" style={{ padding: '6px', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#991b1b' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminScheduledMessages;
