// QUẢN LÝ NGHỆ NHÂN
// Admin xem hồ sơ nghệ nhân và trạng thái xác minh.
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Award } from 'lucide-react';
import { artisanService } from '../../services/artisanService';
import Loading from '../../components/Loading';

export default function ManageArtisans() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadArtisans = () => {
    setLoading(true);
    artisanService
      .getAll({ includeInactive: 'true' })
      .then((data) => setArtisans(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArtisans();
  }, []);

  const handleVerify = async (id, status) => {
    await artisanService.verify(id, status);
    loadArtisans();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ marginBottom: '22px' }}>
        <h1 style={{ margin: '0 0 6px' }}>Quản lý & Xác minh Nghệ nhân</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Khi xác minh hồ sơ Nghệ nhân (<strong>VERIFIED</strong>), tài khoản thành viên liên kết sẽ được nâng quyền lên <strong>ARTISAN</strong>.
        </p>
      </div>

      <div className="form-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f5efe9', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 16px' }}>Nghệ nhân</th>
              <th style={{ padding: '12px 16px' }}>Danh hiệu</th>
              <th style={{ padding: '12px 16px' }}>Chuyên môn</th>
              <th style={{ padding: '12px 16px' }}>Làng nghề / Tỉnh</th>
              <th style={{ padding: '12px 16px' }}>Trạng thái</th>
              <th style={{ padding: '12px 16px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {artisans.map((art) => (
              <tr key={art._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{art.fullName}</td>
                <td style={{ padding: '12px 16px' }}>{art.title}</td>
                <td style={{ padding: '12px 16px' }}>{art.craftSpecialty}</td>
                <td style={{ padding: '12px 16px' }}>
                  {art.villageName} ({art.province})
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {art.verificationStatus === 'VERIFIED' && (
                    <span style={{ color: '#1b5e20', fontWeight: 600 }}>
                      <Award size={14} /> Đã xác minh
                    </span>
                  )}
                  {art.verificationStatus === 'PENDING' && (
                    <span style={{ color: '#b26a00', fontWeight: 600 }}>● Chờ duyệt</span>
                  )}
                  {art.verificationStatus === 'REJECTED' && (
                    <span style={{ color: '#b71c1c', fontWeight: 600 }}>● Từ chối</span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                  {art.verificationStatus !== 'VERIFIED' && (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ background: '#2e7d32', padding: '6px 12px' }}
                      onClick={() => handleVerify(art._id, 'VERIFIED')}
                    >
                      <CheckCircle2 size={14} /> Duyệt Nghệ nhân
                    </button>
                  )}
                  {art.verificationStatus !== 'REJECTED' && (
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ color: '#c62828', padding: '6px 12px' }}
                      onClick={() => handleVerify(art._id, 'REJECTED')}
                    >
                      <XCircle size={14} /> Từ chối
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}