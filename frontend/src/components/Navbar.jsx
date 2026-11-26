// THANH ĐIỀU HƯỚNG
// Hiển thị liên kết user/artisan theo nhánh URL hiện tại.
import { Link, NavLink, useLocation } from 'react-router-dom';
import { User, LogOut, ShieldCheck } from 'lucide-react';
import { ASSETS_IMAGES } from '../assets/images';

export default function Navbar() {
  const { pathname } = useLocation();
  const basePath = pathname.startsWith('/adminuser')
    ? '/adminuser'
    : pathname.startsWith('/artisan')
      ? '/artisan'
      : '/user';
  const villagePath = `${basePath}/villages`;

  return (
    <nav className="container navbar-inner">
      <Link to={basePath} className="brand" aria-label="CraftRoots Trang chủ">
        <img
          src={ASSETS_IMAGES.logo}
          alt="CraftRoots - Tinh hoa đất trời Việt"
          className="navbar-logo"
        />
      </Link>

      <div className="nav-links">
        <NavLink to={basePath} end>
          Trang chủ
        </NavLink>
        <NavLink to="/crafts">Nghề thủ công</NavLink>
        <NavLink to={villagePath}>Làng nghề</NavLink>
        <NavLink to="/artifacts">Hiện vật</NavLink>
        <NavLink to="/contact">Liên hệ</NavLink>
      </div>

      <div className="nav-actions">
        {basePath === '/adminuser' && (
          <Link to="/admin" className="btn-badge-admin">
            <ShieldCheck size={15} /> Quản trị
          </Link>
        )}
        <span className="btn-outline">
          <User size={15} />
          {basePath === '/adminuser' ? 'Quản trị viên' : basePath === '/artisan' ? 'Artisan' : 'User'}
        </span>
        <button type="button" className="btn-icon" title="Đăng xuất" aria-label="Đăng xuất">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
