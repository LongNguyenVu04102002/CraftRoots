// TRANG HỒ SƠ TÀI KHOẢN
// Hiển thị và cập nhật thông tin cá nhân của người dùng đã đăng nhập.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Shield, Award, Save, CheckCircle2, Sparkles } from 'lucide-react';
import { userService } from '../../services/userService';
import Loading from '../../components/Loading';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    userService
      .getProfile()
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
      })
      .catch(() => {
        const cached = localStorage.getItem('craftroots_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          setProfile(parsed);
          setFullName(parsed.fullName || '');
          setPhone(parsed.phone || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      setSaving(true);
      const updated = await userService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim()
      });

      setProfile((prev) => ({ ...prev, ...updated }));

      // Đồng bộ lại thông tin hiển thị trên thanh Navbar
      const cached = localStorage.getItem('craftroots_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        localStorage.setItem(
          'craftroots_user',
          JSON.stringify({ ...parsed, fullName: updated.fullName, phone: updated.phone })
        );
      }

      setMessage('Đã cập nhật thông tin hồ sơ cá nhân thành công!');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading text="Đang tải hồ sơ tài khoản..." />;
  if (!profile) return null;

  const roleLabels = {
    USER: 'Thành viên cộng đồng',
    ARTISAN: 'Nghệ nhân làng nghề',
    ADMIN: 'Quản trị viên hệ thống'
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: '720px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 6px' }}>Hồ sơ Tài khoản Cá nhân</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Quản lý thông tin liên hệ và trạng thái thành viên của bạn trên hệ thống CraftRoots.
        </p>
      </div>

      {/* Thẻ tóm tắt tài khoản & vai trò */}
      <div
        className="form-card"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: '24px',
          background: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: '#261810',
              color: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              fontWeight: 700
            }}
          >
            {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem' }}>{profile.fullName}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> {profile.email}
            </p>
          </div>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: '#fdf3dc',
            color: '#8c5811',
            border: '1px solid #ecd194',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          <Shield size={15} /> {roleLabels[profile.role] || profile.role}
        </span>
      </div>

      {/* Khu vực mời đăng ký Nghệ nhân dành riêng cho tài khoản USER */}
      {profile.role === 'USER' && (
        <div
          style={{
            background: 'linear-gradient(120deg, #2b1a10 0%, #4a2c1b 100%)',
            color: '#ffffff',
            padding: '22px 26px',
            borderRadius: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
            border: '1px solid rgba(246, 211, 101, 0.35)'
          }}
        >
          <div style={{ maxWidth: '440px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              <Sparkles size={15} /> Dành cho Nghệ nhân & Người giữ nghề
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem' }}>
              Bạn là nghệ nhân tại các làng nghề truyền thống?
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#e6d8cc', lineHeight: 1.55 }}>
              {profile.artisanProfile
                ? 'Hồ sơ đăng ký Nghệ nhân của bạn đã được ghi nhận và đang chờ Quản trị viên xét duyệt.'
                : 'Đăng ký xác minh hồ sơ Nghệ nhân để trực tiếp đóng góp tư liệu làng nghề, quy trình chế tác và tác phẩm di sản lên cổng thông tin.'}
            </p>
          </div>

          {!profile.artisanProfile && (
            <Link
              to="/artisan/apply"
              className="btn-primary"
              style={{ background: 'var(--gold)', color: '#261810', fontWeight: 700 }}
            >
              <Award size={17} /> Đăng ký trở thành Nghệ nhân
            </Link>
          )}
        </div>
      )}

      {/* Biểu mẫu cập nhật Họ tên & Số điện thoại */}
      <form onSubmit={handleUpdate} className="form-card">
        <h3 style={{ margin: '0 0 6px' }}>Cập nhật thông tin cá nhân</h3>

        {message && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#e8f5e9',
              color: '#1b5e20',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.9rem'
            }}
          >
            <CheckCircle2 size={17} /> {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fdecea',
              color: '#b71c1c',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '0.9rem'
            }}
          >
            {error}
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mail size={15} /> Email tài khoản (không thể thay đổi)
        </label>
        <input
          type="email"
          value={profile.email}
          disabled
          style={{ background: '#f5efe9', color: '#8c786a', cursor: 'not-allowed' }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={15} /> Họ và tên *
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Phone size={15} /> Số điện thoại liên hệ
        </label>
        <input
          type="tel"
          placeholder="Nhập số điện thoại của bạn"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div style={{ marginTop: '8px' }}>
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={16} /> {saving ? 'Đang lưu thay đổi...' : 'Lưu thông tin cập nhật'}
          </button>
        </div>
      </form>
    </div>
  );
}