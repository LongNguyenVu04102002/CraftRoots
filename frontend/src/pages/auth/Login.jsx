// TRANG ĐĂNG NHẬP
// Form nhập email/mật khẩu và hiển thị kết quả đăng nhập.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.login({ email, password });
      localStorage.setItem('craftroots_token', res.token);
      localStorage.setItem('craftroots_user', JSON.stringify(res.user));
      if (res.user.role === 'ADMIN') navigate('/admin');
      else if (res.user.role === 'ARTISAN') navigate('/artisan/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại.');
    }
  };

  return (
    <div className="container page-wrap" style={{ maxWidth: '460px' }}>
      <form onSubmit={handleLogin} className="form-card">
        <h2>Đăng nhập CraftRoots</h2>
        {error && <div className="alert-error">{error}</div>}
        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Mật khẩu</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Đăng nhập</button>
        <p style={{ marginTop: '14px', textAlign: 'center' }}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
}