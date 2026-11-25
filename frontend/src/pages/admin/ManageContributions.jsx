// KIỂM DUYỆT ĐỀ XUẤT
// Admin xem nội dung đề xuất, duyệt/từ chối và nhập lý do phản hồi.
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { contributionService } from '../../services/contributionService';
import Loading from '../../components/Loading';

const TARGET_LABELS = {
  VILLAGE: 'Làng nghề',
  CRAFT: 'Nghề thủ công',
  ARTIFACT: 'Hiện vật'
};

export default function ManageContributions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [processingId, setProcessingId] = useState('');

  const loadData = () => {
    setLoading(true);
    contributionService
      .getAll()
      .then((data) => setList(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (id, status) => {
    if (status === 'REJECTED' && !adminNote.trim()) {
      alert('Vui lòng nhập lý do từ chối vào ô ghi chú phản hồi trước khi bấm Từ chối.');
      return;
    }

    try {
      setProcessingId(id);
      await contributionService.review(id, { status, adminNote: adminNote.trim() });
      setSelectedItem(null);
      setAdminNote('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xử lý kiểm duyệt đề xuất.');
    } finally {
      setProcessingId('');
    }
  };

  if (loading) return <Loading text="Đang tải danh sách đề xuất..." />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 6px' }}>Kiểm duyệt Đề xuất Di sản</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Khi bấm <strong>Duyệt xuất bản</strong>, tư liệu sẽ tự động được đồng bộ lên trang công khai.
        </p>
      </div>

      {/* Khung xem chi tiết & nhập ghi chú duyệt */}
      {selectedItem && (
        <div
          className="form-card"
          style={{
            marginBottom: '24px',
            border: '2px solid var(--primary)',
            background: '#fffdf9'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>
              Chi tiết đề xuất: {selectedItem.title} ({TARGET_LABELS[selectedItem.targetType]})
            </h3>
            <button type="button" className="btn-outline" onClick={() => setSelectedItem(null)}>
              Đóng
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            <strong>Người gửi:</strong> {selectedItem.submitterName} | <strong>Hành động:</strong>{' '}
            {selectedItem.actionType}
          </p>

          {selectedItem.payload?.thumbnail && (
            <img
              src={selectedItem.payload.thumbnail}
              alt={selectedItem.title}
              style={{ width: '240px', height: '140px', objectFit: 'cover', borderRadius: '10px' }}
            />
          )}

          <pre
            style={{
              background: '#f5efe9',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              overflowX: 'auto',
              margin: 0
            }}
          >
            {JSON.stringify(selectedItem.payload, null, 2)}
          </pre>

          <label>Ghi chú phản hồi / Lý do từ chối gửi tới Nghệ nhân:</label>
          <input
            type="text"
            placeholder="Nhập ghi chú duyệt bài hoặc lý do cần bổ sung thông tin..."
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
            <button
              type="button"
              disabled={processingId === selectedItem._id}
              onClick={() => handleReview(selectedItem._id, 'APPROVED')}
              className="btn-primary"
              style={{ background: '#2e7d32' }}
            >
              <CheckCircle2 size={16} /> Duyệt xuất bản
            </button>
            <button
              type="button"
              disabled={processingId === selectedItem._id}
              onClick={() => handleReview(selectedItem._id, 'REJECTED')}
              className="btn-primary"
              style={{ background: '#c62828' }}
            >
              <XCircle size={16} /> Từ chối đề xuất
            </button>
          </div>
        </div>
      )}

      {/* Bảng danh sách đề xuất */}
      <div className="form-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f5efe9', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '14px 16px' }}>Tiêu đề đề xuất</th>
              <th style={{ padding: '14px 16px' }}>Phân loại</th>
              <th style={{ padding: '14px 16px' }}>Nghệ nhân gửi</th>
              <th style={{ padding: '14px 16px' }}>Ngày gửi</th>
              <th style={{ padding: '14px 16px' }}>Trạng thái</th>
              <th style={{ padding: '14px 16px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{item.title}</td>
                <td style={{ padding: '14px 16px' }}>
                  {TARGET_LABELS[item.targetType] || item.targetType}
                </td>
                <td style={{ padding: '14px 16px' }}>{item.submitterName}</td>
                <td style={{ padding: '14px 16px' }}>
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {item.status === 'APPROVED' && (
                    <span style={{ color: '#1b5e20', fontWeight: 600 }}>● Đã duyệt</span>
                  )}
                  {item.status === 'REJECTED' && (
                    <span style={{ color: '#b71c1c', fontWeight: 600 }}>● Từ chối</span>
                  )}
                  {item.status === 'PENDING' && (
                    <span style={{ color: '#b26a00', fontWeight: 600 }}>
                      <Clock size={13} /> Chờ duyệt
                    </span>
                  )}
                </td>
                <td style={{ padding: '14px 16px', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setSelectedItem(item);
                      setAdminNote(item.adminNote || '');
                    }}
                  >
                    <Eye size={15} /> Xem & Duyệt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}