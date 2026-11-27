// BỐ CỤC TRANG QUẢN TRỊ
// Bao gồm menu Admin, thanh tiêu đề và khu vực nội dung quản trị.
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Map,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { ASSETS_IMAGES } from '../assets/images';

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/adminuser">
            <img src={ASSETS_IMAGES.logo} alt="CraftRoots" />
          </Link>
          <span>Hệ thống Quản trị</span>
        </div>

        <nav className="admin-menu">
          <NavLink to="/admin" end>
            <LayoutDashboard size={17} /> Tổng quan
          </NavLink>
          <NavLink to="/admin/regions">
            <Map size={17} /> Vùng miền
          </NavLink>
          <NavLink to="/admin/villages">
            <MapPin size={17} /> Làng nghề
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/adminuser" className="admin-back-link">
            <ArrowLeft size={16} /> Về cổng công khai
          </Link>
          <button type="button" className="admin-logout-btn">
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
