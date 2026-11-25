// BẢNG ĐIỀU KHIỂN NGHỆ NHÂN
// Hiển thị trạng thái hồ sơ và các đề xuất mà nghệ nhân đã gửi.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  MessageSquareWarning
} from 'lucide-react';
import { contributionService } from '../../services/contributionService';
import Loading from '../../components/Loading';

const TARGET_LABELS = {
  VILLAGE: 'Làng nghề truyền thống',
  CRAFT: 'Nghề thủ công',
  ARTIFACT: 'Hiện vật / Tác phẩm'
};

const ACTION_LABELS = {
  CREATE: 'Thêm mới tư liệu',
  UPDATE: 'Cập nhật thông tin',
  DELETE: 'Đề xuất ẩn/xóa'
};

export default function ArtisanDashboard() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  const rawUser = localStorage.getItem('craftroots_user');
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    contributionService
      .getMine()
      .then((data) => setContributions(Array.isArray(data) ? data : []))
      .catch(() => setContributions([]))
      .finally(() => setLoading(false));
  }, []);

  const renderStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '999px',
            background: '#e8f5e9',
            color: '#1b5e20',
            fontWeight: 600,
            fontSize: '0.82rem'
          }}
        >
          <CheckCircle2 size={14} /> Đã duyệt
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '999px',
            background: '#fdecea',
            color: '#b71c1c',
            fontWeight: 600,
            fontSize: '0.82rem'
          }}
        >
          <XCircle size={14} /> Từ chối
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 12px',
          borderRadius: '999px',
          background: '#fff8e1',
          color: '#b26a00',
          fontWeight: 600,
          fontSize: '0.82rem'
        }}
      >
        <Clock size={14} /> Chờ duyệt
      </span>
    );
  };

  return (
    <div className="container page-wrap">
      {/* Header khu vực Nghệ nhân */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              marginBottom: '4px'
            }}
          >
            <Sparkles size={15} /> Không gian đóng góp của Nghệ nhân
          </span>
          <h1 style={{ margin: '0 0 6px' }}>
            Xin chào, {currentUser?.fullName || 'Nghệ nhân'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Theo dõi trạng thái kiểm duyệt các tư liệu làng nghề, quy trình chế tác và hiện vật bạn đã gửi.
          </p>
        </div>

        <Link
          to="/artisan/contribute"
          className="btn-primary"
          style={{ padding: '11px 20px', fontSize: '0.95rem' }}
        >
          <PlusCircle size={18} /> Gửi đề xuất di sản mới
        </Link>
      </div>

      {/* Thống kê nhanh 3 trạng thái */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div className="form-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng đề xuất đã gửi</span>
          <strong style={{ fontSize: '1.7rem', color: 'var(--text-dark)' }}>
            {contributions.length}
          </strong>
        </div>
        <div className="form-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.85rem', color: '#b26a00' }}>Đang chờ kiểm duyệt</span>
          <strong style={{ fontSize: '1.7rem', color: '#b26a00' }}>
            {contributions.filter((c) => c.status === 'PENDING').length}
          </strong>
        </div>
        <div className="form-card" style={{ padding: '18px 20px' }}>
          <span style={{ fontSize: '0.85rem', color: '#1b5e20' }}>Đã duyệt xuất bản</span>
          <strong style={{ fontSize: '1.7rem', color: '#1b5e20' }}>
            {contributions.filter((c) => c.status === 'APPROVED').length}
          </strong>
        </div>
      </div>

      {/* Danh sách các đề xuất đã gửi */}
      {loading ? (
        <Loading text="Đang tải danh sách đề xuất của bạn..." />
      ) : contributions.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ margin: '0 0 6px' }}>Bạn chưa gửi đề xuất di sản nào</h3>
          <p style={{ margin: '0 0 18px', color: 'var(--text-muted)' }}>
            Hãy bắt đầu chia sẻ câu chuyện làng nghề, kỹ thuật chế tác hoặc tác phẩm tiêu biểu của bạn.
          </p>
          <div>
            <Link to="/artisan/contribute" className="btn-primary">
              <PlusCircle size={16} /> Gửi đề xuất di sản mới
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {contributions.map((item) => (
            <div
              key={item._id}
              className="form-card"
              style={{ padding: '20px 24px', gap: '10px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '6px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span
                      style={{
                        background: '#f3ebe2',
                        color: 'var(--primary)',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600
                      }}
                    >
                      {TARGET_LABELS[item.targetType] || item.targetType}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      • {ACTION_LABELS[item.actionType] || item.actionType}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      • Ngày gửi: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{item.title}</h3>
                </div>

                {renderStatusBadge(item.status)}
              </div>

              {/* Hiển thị lý do phản hồi của Admin nếu bị Từ chối (hoặc có ghi chú) */}
              {item.status === 'REJECTED' && (
                <div
                  style={{
                    marginTop: '6px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#fdecea',
                    color: '#961919',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  <MessageSquareWarning size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Lý do từ chối từ Quản trị viên:</strong>{' '}
                    {item.adminNote || 'Thông tin chưa đầy đủ, vui lòng bổ sung và gửi lại.'}
                  </div>
                </div>
              )}

              {item.status === 'APPROVED' && item.adminNote && (
                <div
                  style={{
                    marginTop: '6px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#e8f5e9',
                    color: '#1b5e20',
                    fontSize: '0.88rem'
                  }}
                >
                  <strong>Ghi chú duyệt bài:</strong> {item.adminNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}