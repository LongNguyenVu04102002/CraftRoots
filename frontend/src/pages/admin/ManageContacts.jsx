// QUẢN LÝ LIÊN HỆ
// Admin xem và cập nhật trạng thái các tin nhắn liên hệ.
import { useEffect, useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { contributionService } from '../../services/contributionService';
import Loading from '../../components/Loading';

export default function ManageContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = () => {
    setLoading(true);
    contributionService
      .getContacts()
      .then((data) => setContacts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleStatusChange = async (id, status) => {
    await contributionService.updateContact(id, { status });
    loadContacts();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ margin: 0 }}>Quản lý Tin nhắn Liên hệ</h1>
      </div>

      {contacts.length === 0 ? (
        <div className="form-card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Chưa có tin nhắn liên hệ nào.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {contacts.map((c) => (
            <div key={c._id} className="form-card" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px' }}>{c.subject}</h3>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Từ: <strong>{c.fullName}</strong> ({c.email}) •{' '}
                    {new Date(c.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {c.status === 'RESOLVED' ? (
                    <span style={{ color: '#2e7d32', fontWeight: 600, fontSize: '0.88rem' }}>
                      <CheckCircle2 size={15} /> Đã xử lý
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ background: '#2e7d32', padding: '6px 14px' }}
                      onClick={() => handleStatusChange(c._id, 'RESOLVED')}
                    >
                      <Clock size={14} /> Đánh dấu đã phản hồi
                    </button>
                  )}
                </div>
              </div>

              <p style={{ margin: '8px 0 0', lineHeight: 1.6, background: '#faf6f1', padding: '12px', borderRadius: '8px' }}>
                {c.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}