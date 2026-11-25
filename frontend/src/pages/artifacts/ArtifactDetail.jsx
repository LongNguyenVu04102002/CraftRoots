// TRANG CHI TIẾT HIỆN VẬT
// Hiển thị mô tả, kỹ thuật, ý nghĩa văn hóa, hình ảnh và video.
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, Hammer, Calendar, Ruler, Layers, Sparkles, ArrowLeft } from 'lucide-react';
import { artifactService } from '../../services/artifactService';
import Loading from '../../components/Loading';

export default function ArtifactDetail() {
  const { slug } = useParams();
  const [artifact, setArtifact] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    artifactService
      .getBySlug(slug)
      .then(setArtifact)
      .catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <div className="container page-wrap" style={{ textAlign: 'center' }}>
        <h2>Không tìm thấy hồ sơ hiện vật</h2>
        <Link to="/artifacts" className="btn-primary">
          Quay lại phòng trưng bày
        </Link>
      </div>
    );
  }

  if (!artifact) return <Loading text="Đang tải hồ sơ hiện vật di sản..." />;

  return (
    <div className="container page-wrap detail-page">
      <Link
        to="/artifacts"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--primary)',
          fontWeight: 600,
          textDecoration: 'none'
        }}
      >
        <ArrowLeft size={16} /> Quay lại phòng trưng bày hiện vật
      </Link>

      {/* Hồ sơ trưng bày 2 cột */}
      <div className="detail-hero">
        <img src={artifact.thumbnail} alt={artifact.name} className="detail-cover" />

        <div className="detail-intro">
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#fdf3dc',
              color: '#8c5811',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '10px'
            }}
          >
            <Sparkles size={13} /> Hiện vật lưu trữ di sản
          </span>

          <h1 style={{ margin: '0 0 14px', fontSize: '1.9rem' }}>{artifact.name}</h1>

          {/* Bảng thông số kỹ thuật hiện vật */}
          <div className="spec-box" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hammer size={16} color="var(--primary)" />
              <span>
                <strong>Thuộc dòng nghề:</strong> {artifact.craftName}
              </span>
            </p>

            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="var(--primary)" />
              <span>
                <strong>Nghệ nhân chế tác:</strong> {artifact.artisanName || 'Đang cập nhật'}
              </span>
            </p>

            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="var(--primary)" />
              <span>
                <strong>Niên đại / Năm hoàn thiện:</strong> {artifact.eraOrYear || 'Đương đại'}
              </span>
            </p>

            {artifact.dimensions && (
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ruler size={16} color="var(--primary)" />
                <span>
                  <strong>Kích thước:</strong> {artifact.dimensions}
                </span>
              </p>
            )}

            {artifact.material && (
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="var(--primary)" />
                <span>
                  <strong>Chất liệu chế tác:</strong> {artifact.material}
                </span>
              </p>
            )}

            {artifact.technique && (
              <p style={{ margin: 0 }}>
                <strong>Kỹ thuật thực hiện:</strong> {artifact.technique}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ý nghĩa văn hóa & Mô tả chi tiết */}
      <div
        className="form-card"
        style={{ marginTop: '28px', padding: '24px 28px', gap: '16px' }}
      >
        {artifact.culturalMeaning && (
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>Ý nghĩa Văn hóa & Nghệ thuật</h2>
            <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--text-dark)' }}>
              {artifact.culturalMeaning}
            </p>
          </div>
        )}

        {artifact.description && (
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.15rem' }}>Mô tả chi tiết tác phẩm</h3>
            <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--text-muted)' }}>
              {artifact.description}
            </p>
          </div>
        )}
      </div>

      {/* Video tư liệu chế tác (nếu có) */}
      {artifact.videoUrl && (
        <div className="form-card" style={{ marginTop: '28px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.3rem' }}>Tư liệu video chế tác</h2>
          <video
            src={artifact.videoUrl}
            controls
            style={{ width: '100%', maxHeight: '460px', borderRadius: '12px', background: '#000' }}
          />
        </div>
      )}

      {/* Thư viện ảnh góc nhìn khác (nếu có) */}
      {Array.isArray(artifact.gallery) && artifact.gallery.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.35rem' }}>Các góc nhìn chi tiết</h2>
          <div className="cards-grid">
            {artifact.gallery.map((item, idx) => (
              <div key={idx} className="heritage-card">
                <div className="card-thumb">
                  <img src={item.url} alt={item.caption || artifact.name} />
                </div>
                {item.caption && (
                  <div className="card-body">
                    <p style={{ margin: 0 }}>{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}