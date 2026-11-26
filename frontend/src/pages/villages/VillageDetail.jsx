// TRANG CHI TIẾT LÀNG NGHỀ
// Hiển thị lịch sử, địa chỉ, mô tả và ảnh đại diện.
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Landmark, ArrowLeft } from 'lucide-react';
import { villageService } from '../../services/villageService';
import Loading from '../../components/Loading';

export default function VillageDetail({ backPath = '/user/villages' }) {
  const { slug } = useParams();
  const [village, setVillage] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    villageService
      .getBySlug(slug)
      .then(setVillage)
      .catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <div className="container page-wrap" style={{ textAlign: 'center' }}>
        <h2>Không tìm thấy thông tin làng nghề</h2>
        <Link to={backPath} className="btn-primary">
          Quay lại danh sách làng nghề
        </Link>
      </div>
    );
  }

  if (!village) return <Loading text="Đang tải hồ sơ làng nghề..." />;

  return (
    <div className="container page-wrap detail-page">
      <Link
        to={backPath}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--primary)',
          fontWeight: 600,
          textDecoration: 'none'
        }}
      >
        <ArrowLeft size={16} /> Quay lại danh sách làng nghề
      </Link>

      {/* Khối thông tin tổng quan 2 cột */}
      <div className="detail-hero">
        <img src={village.thumbnail} alt={village.name} className="detail-cover" />

        <div className="detail-intro">
          <h1 style={{ margin: '0 0 12px', fontSize: '1.95rem' }}>{village.name}</h1>

          <div className="spec-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>
                <strong>Tỉnh / Thành phố:</strong> {village.province}
                {village.commune ? ` — ${village.commune}` : ''}
              </span>
            </p>
            {village.address && (
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={16} color="var(--primary)" />
                <span>
                  <strong>Địa chỉ cụ thể:</strong> {village.address}
                </span>
              </p>
            )}
          </div>

          {village.description && (
            <div style={{ marginTop: '18px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Giới thiệu không gian làng nghề</h3>
              <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-muted)' }}>
                {village.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lịch sử hình thành & phát triển */}
      {village.history && (
        <div
          className="form-card"
          style={{ marginTop: '28px', padding: '24px 28px' }}
        >
          <h2 style={{ margin: '0 0 10px', fontSize: '1.35rem' }}>
            Lịch sử hình thành & Giá trị di sản
          </h2>
          <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--text-dark)' }}>
            {village.history}
          </p>
        </div>
      )}

    </div>
  );
}