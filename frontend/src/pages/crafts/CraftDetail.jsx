// TRANG CHI TIẾT NGHỀ THỦ CÔNG
// Hiển thị lịch sử, nguyên liệu, công cụ, quy trình và làng nghề liên quan.
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { craftService } from '../../services/craftService';
import Loading from '../../components/Loading';

export default function CraftDetail() {
  const { slug } = useParams();
  const [craft, setCraft] = useState(null);

  useEffect(() => {
    craftService.getBySlug(slug).then(setCraft);
  }, [slug]);

  if (!craft) return <Loading />;

  return (
    <div className="container page-wrap detail-page">
      <Link to="/crafts" className="back-link">← Quay lại danh sách nghề thủ công</Link>
      <div className="detail-hero">
        <img src={craft.thumbnail} alt={craft.name} className="detail-cover" />
        <div className="detail-intro">
          <span className="card-badge">{craft.category}</span>
          <h1>{craft.name}</h1>
          <p className="detail-meta">
            <strong>Vùng miền:</strong> {craft.regionName} | <strong>Làng nghề:</strong> {craft.villageName}
          </p>
          <p>{craft.culturalBackground}</p>
          <div className="spec-box">
            <p><strong>Nguyên liệu chính:</strong> {craft.material}</p>
            <p><strong>Kỹ thuật đặc trưng:</strong> {craft.technique}</p>
            {craft.tools?.length > 0 && (
              <p><strong>Công cụ chế tác:</strong> {craft.tools.join(', ')}</p>
            )}
          </div>
        </div>
      </div>

      {craft.process?.length > 0 && (
        <div className="detail-section">
          <h2>Quy trình chế tác truyền thống</h2>
          <ol className="process-list">
            {craft.process.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}