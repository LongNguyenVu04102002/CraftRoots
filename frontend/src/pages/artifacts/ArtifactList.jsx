// TRANG DANH SÁCH HIỆN VẬT
// Hiển thị các hồ sơ hiện vật/sản phẩm thủ công mang giá trị di sản; không bán hàng.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Award, Search, Sparkles } from 'lucide-react';
import { artifactService } from '../../services/artifactService';
import Loading from '../../components/Loading';

export default function ArtifactList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') || '';

  useEffect(() => {
    setLoading(true);
    artifactService
      .getAll({ q })
      .then((data) => setArtifacts(Array.isArray(data) ? data : []))
      .catch(() => setArtifacts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container page-wrap">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '0.88rem',
            marginBottom: '6px'
          }}
        >
          <Sparkles size={15} /> Không gian Trưng bày & Bảo tồn Di sản
        </span>
        <h1 style={{ margin: '0 0 8px' }}>Hiện vật & Tác phẩm Thủ công Độc bản</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Lưu trữ hồ sơ kỹ thuật, chất liệu và giá trị văn hóa của các tác phẩm tiêu biểu do nghệ nhân Việt Nam chế tác.
        </p>
      </div>

      {/* Thanh tìm kiếm hiện vật */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Tìm tên hiện vật, dòng nghề, nghệ nhân hoặc chất liệu..."
            value={q}
            onChange={(e) => setSearchParams({ q: e.target.value })}
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>
      </div>

      {loading ? (
        <Loading text="Đang tải không gian trưng bày hiện vật..." />
      ) : artifacts.length === 0 ? (
        <div className="form-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Chưa có hiện vật nào khớp với từ khóa "{q}".
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {artifacts.map((artifact) => (
            <Link
              key={artifact._id || artifact.slug}
              to={`/artifacts/${artifact.slug}`}
              className="heritage-card"
            >
              <div className="card-thumb">
                <img src={artifact.thumbnail} alt={artifact.name} />
                <span className="card-badge">{artifact.craftName}</span>
              </div>
              <div className="card-body">
                <span
                  className="card-meta"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Award size={13} /> Nghệ nhân: {artifact.artisanName || 'Nghệ nhân làng nghề'}
                </span>
                <h3>{artifact.name}</h3>
                <p>{artifact.culturalMeaning || artifact.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}