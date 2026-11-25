// TRANG HỒ SƠ NGHỆ NHÂN
// Hiển thị thông tin giới thiệu và hoạt động nghề của nghệ nhân.
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, MapPin, Briefcase, Sparkles, ArrowLeft } from 'lucide-react';
import { artisanService } from '../../services/artisanService';
import Loading from '../../components/Loading';

export default function ArtisanProfile() {
  const { slug } = useParams();
  const [artisan, setArtisan] = useState(null);

  useEffect(() => {
    artisanService.getBySlug(slug).then(setArtisan);
  }, [slug]);

  if (!artisan) return <Loading text="Đang tải hồ sơ nghệ nhân..." />;

  return (
    <div className="container page-wrap" style={{ maxWidth: '880px' }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--primary)',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: '18px'
        }}
      >
        <ArrowLeft size={16} /> Quay lại trang chủ
      </Link>

      <div className="detail-hero" style={{ gridTemplateColumns: '280px 1fr' }}>
        <img
          src={
            artisan.avatar ||
            'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=500'
          }
          alt={artisan.fullName}
          style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '14px' }}
        />

        <div>
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
              marginBottom: '8px'
            }}
          >
            <Award size={14} /> {artisan.title}
          </span>
          <h1 style={{ margin: '0 0 12px' }}>Nghệ nhân {artisan.fullName}</h1>

          <div className="spec-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span>
                <strong>Chuyên môn:</strong> {artisan.craftSpecialty}
              </span>
            </p>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--primary)" />
              <span>
                <strong>Làng nghề:</strong> {artisan.villageName} ({artisan.province})
              </span>
            </p>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} color="var(--primary)" />
              <span>
                <strong>Thâm niên giữ nghề:</strong> {artisan.yearsOfExperience} năm
              </span>
            </p>
          </div>

          <div style={{ marginTop: '18px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>Hành trình & Tâm huyết nghề</h3>
            <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--text-muted)' }}>{artisan.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}