// THANH ĐIỀU HƯỚNG
// Hiển thị các liên kết chức năng phù hợp với trạng thái đăng nhập/vai trò.
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem('craftroots_user');
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('craftroots_token');
    localStorage.removeItem('craftroots_user');
    navigate('/login');
  };

  return (
    <nav className="container navbar-inner">
      <Link to="/" className="brand" aria-label="CraftRoots Trang chủ">
        <img
          src="/images/Logo_slogan.png"
          alt="CraftRoots - Tinh hoa đất trời Việt"
          className="navbar-logo"
        />
      </Link>

      <div className="nav-links">
        <NavLink to="/" end>
          Trang chủ
        </NavLink>
        <NavLink to="/crafts">Nghề thủ công</NavLink>
        <NavLink to="/villages">Làng nghề</NavLink>
        <NavLink to="/artifacts">Hiện vật</NavLink>
        <NavLink to="/contact">Liên hệ</NavLink>
      </div>

      <div className="nav-actions">
        {!currentUser ? (
          <>
            <Link to="/login" className="btn-outline">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn-primary">
              Đăng ký
            </Link>
          </>
        ) : (
          <>
            {currentUser.role === 'ADMIN' && (
              <Link to="/admin" className="btn-badge-admin">
                <ShieldCheck size={15} /> Quản trị
              </Link>
            )}
            {currentUser.role === 'ARTISAN' && (
              <Link to="/artisan/dashboard" className="btn-badge-artisan">
                <Sparkles size={15} /> Góc Nghệ nhân
              </Link>
            )}
            <Link to="/profile" className="btn-outline">
              <User size={15} /> {currentUser.fullName}
            </Link>
            <button type="button" onClick={handleLogout} className="btn-icon" title="Đăng xuất">
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}