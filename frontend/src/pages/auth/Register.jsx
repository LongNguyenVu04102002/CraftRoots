// TRANG ĐĂNG KÝ
// Form tạo tài khoản USER mới.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { userService } from '../../services/userService';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await userService.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password
      });

      localStorage.setItem('craftroots_token', res.token);
      localStorage.setItem('craftroots_user', JSON.stringify(res.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: '480px' }}>
      <form onSubmit={handleRegister} className="form-card">
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          <h2 style={{ margin: '0 0 6px' }}>Đăng ký thành viên CraftRoots</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Tham gia cộng đồng gìn giữ và lan tỏa tinh hoa làng nghề Việt
          </p>
        </div>

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

        <label>Họ và tên *</label>
        <input
          type="text"
          name="fullName"
          required
          placeholder="Nhập họ tên đầy đủ"
          value={form.fullName}
          onChange={handleChange}
        />

        <label>Email đăng nhập *</label>
        <input
          type="email"
          name="email"
          required
          placeholder="example@gmail.com"
          value={form.email}
          onChange={handleChange}
        />

        <label>Số điện thoại</label>
        <input
          type="tel"
          name="phone"
          placeholder="09xx xxx xxx"
          value={form.phone}
          onChange={handleChange}
        />

        <label>Mật khẩu *</label>
        <input
          type="password"
          name="password"
          required
          placeholder="Tối thiểu 6 ký tự"
          value={form.password}
          onChange={handleChange}
        />

        <label>Xác nhận mật khẩu *</label>
        <input
          type="password"
          name="confirmPassword"
          required
          placeholder="Nhập lại mật khẩu"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '6px', padding: '11px 16px' }}
        >
          <UserPlus size={17} /> {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
        </button>

        <p style={{ margin: '12px 0 0', textAlign: 'center', fontSize: '0.92rem' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </div>
  );
}