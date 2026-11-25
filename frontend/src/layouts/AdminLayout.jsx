// BỐ CỤC TRANG QUẢN TRỊ
// Bao gồm menu Admin, thanh tiêu đề và khu vực nội dung quản trị.
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Hammer,
  MapPin,
  Map,
  Gem,
  Award,
  FileCheck2,
  Users,
  Mail,
  ArrowLeft,
  LogOut
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('craftroots_token');
    localStorage.removeItem('craftroots_user');
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/">
            <img src="/images/Logo_slogan.png" alt="CraftRoots" />
          </Link>
          <span>Hệ thống Quản trị</span>
        </div>

        <nav className="admin-menu">
          <NavLink to="/admin" end><LayoutDashboard size={17} /> Tổng quan</NavLink>
          <NavLink to="/admin/crafts"><Hammer size={17} /> Danh mục & Nghề</NavLink>
          <NavLink to="/admin/regions"><Map size={17} /> Vùng miền</NavLink>
          <NavLink to="/admin/villages"><MapPin size={17} /> Làng nghề</NavLink>
          <NavLink to="/admin/artifacts"><Gem size={17} /> Hiện vật thủ công</NavLink>
          <NavLink to="/admin/artisans"><Award size={17} /> Nghệ nhân</NavLink>
          <NavLink to="/admin/contributions"><FileCheck2 size={17} /> Kiểm duyệt đề xuất</NavLink>
          <NavLink to="/admin/users"><Users size={17} /> Tài khoản</NavLink>
          <NavLink to="/admin/contacts"><Mail size={17} /> Tin nhắn liên hệ</NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-back-link"><ArrowLeft size={16} /> Về cổng công khai</Link>
          <button type="button" onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
