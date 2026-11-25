// TRANG ĐĂNG KÝ TRỞ THÀNH NGHỆ NHÂN
// USER gửi thông tin/hồ sơ để Admin xem xét.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { userService } from '../../services/userService';

export default function ApplyArtisan() {
  const [form, setForm] = useState({
    title: 'Nghệ nhân làng nghề',
    craftSpecialty: '',
    villageName: '',
    province: '',
    yearsOfExperience: 15,
    bio: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      setSubmitting(true);
      const res = await userService.applyArtisan(form);

      // Cập nhật cache user để hiển thị trạng thái đã nộp hồ sơ
      const cached = localStorage.getItem('craftroots_user');
      if (cached && res.artisan) {
        const parsed = JSON.parse(cached);
        localStorage.setItem(
          'craftroots_user',
          JSON.stringify({ ...parsed, artisanProfile: res.artisan })
        );
      }

      setSuccessMsg(
        res.message || 'Đã gửi hồ sơ đăng ký Nghệ nhân thành công! Vui lòng chờ Quản trị viên xét duyệt.'
      );
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi hồ sơ đăng ký. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: '680px' }}>
      <Link
        to="/profile"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--primary)',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: '16px'
        }}
      >
        <ArrowLeft size={16} /> Quay lại hồ sơ cá nhân
      </Link>

      <div className="page-header" style={{ marginBottom: '22px' }}>
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
          <Award size={16} /> Xác minh Nghệ nhân Di sản
        </span>
        <h1 style={{ margin: '0 0 8px' }}>Đăng ký Hồ sơ Nghệ nhân Làng nghề</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Cung cấp thông tin quá trình gắn bó với nghề truyền thống để Ban quản trị xét duyệt cấp quyền đóng góp tư liệu di sản.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#e8f5e9',
              color: '#1b5e20',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.92rem',
              fontWeight: 500
            }}
          >
            <CheckCircle2 size={18} /> {successMsg}
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#fdecea',
              color: '#b71c1c',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.92rem'
            }}
          >
            {error}
          </div>
        )}

        <label>Danh hiệu / Vai trò chuyên môn</label>
        <select name="title" value={form.title} onChange={handleChange}>
          <option value="Nghệ nhân làng nghề">Nghệ nhân làng nghề</option>
          <option value="Nghệ nhân Ưu tú">Nghệ nhân Ưu tú</option>
          <option value="Nghệ nhân Nhân dân">Nghệ nhân Nhân dân</option>
          <option value="Thợ thủ công bậc thầy">Thợ thủ công bậc thầy</option>
        </select>

        <label>Dòng nghề thủ công chuyên sâu *</label>
        <input
          type="text"
          name="craftSpecialty"
          required
          placeholder="VD: Gốm men rạn cổ, Dệt lụa tơ sen, Khắc gỗ tranh Đông Hồ..."
          value={form.craftSpecialty}
          onChange={handleChange}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Làng nghề gắn bó *</label>
            <input
              type="text"
              name="villageName"
              required
              placeholder="VD: Làng gốm Bát Tràng"
              value={form.villageName}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label>Tỉnh / Thành phố *</label>
            <input
              type="text"
              name="province"
              required
              placeholder="VD: Hà Nội"
              value={form.province}
              onChange={handleChange}
            />
          </div>
        </div>

        <label>Số năm kinh nghiệm làm nghề *</label>
        <input
          type="number"
          name="yearsOfExperience"
          min="1"
          max="80"
          required
          value={form.yearsOfExperience}
          onChange={handleChange}
        />

        <label>Tiểu sử nghề nghiệp & Thành tựu tiêu biểu *</label>
        <textarea
          name="bio"
          rows="5"
          required
          placeholder="Chia sẻ hành trình học nghề, bí quyết kỹ thuật truyền thống hoặc các tác phẩm tiêu biểu của bạn..."
          value={form.bio}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
          style={{ justifyContent: 'center', marginTop: '8px', padding: '12px 18px' }}
        >
          <Send size={16} /> {submitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ xét duyệt Nghệ nhân'}
        </button>
      </form>
    </div>
  );
}