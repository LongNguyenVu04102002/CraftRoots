// FOOTER DÙNG CHUNG
// Hiển thị thông tin cuối trang, liên hệ và các liên kết cần thiết.
import { Link, useLocation } from 'react-router-dom';
import { ASSETS_IMAGES } from '../assets/images';

export default function Footer() {
  const { pathname } = useLocation();
  const basePath = pathname.startsWith('/adminuser')
    ? '/adminuser'
    : pathname.startsWith('/artisan')
      ? '/artisan'
      : '/user';
  const villagePath = `${basePath}/villages`;

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <Link to={basePath} className="footer-logo-badge" aria-label="CraftRoots Trang chủ">
            <img
              src={ASSETS_IMAGES.logo}
              alt="CraftRoots - Tinh hoa đất trời Việt"
              className="footer-logo-img"
            />
          </Link>
          <p className="footer-desc">
            Cổng thông tin số khám phá, kết nối và bảo tồn tinh hoa các làng nghề thủ công truyền thống Việt Nam.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Khám phá</h4>
          <ul className="footer-links">
            <li><Link to="/crafts">Danh mục nghề thủ công</Link></li>
            <li><Link to={villagePath}>Bản đồ làng nghề truyền thống</Link></li>
            <li><Link to="/artifacts">Không gian trưng bày hiện vật</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Kết nối & Đóng góp</h4>
          <ul className="footer-links">
            <li><Link to="/artisan/apply">Đăng ký hồ sơ Nghệ nhân</Link></li>
            <li><Link to="/profile">Tài khoản cá nhân</Link></li>
            <li><Link to="/contact">Gửi phản hồi / Liên hệ</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 CraftRoots Portal — Tinh Hoa Đất Trời Việt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}