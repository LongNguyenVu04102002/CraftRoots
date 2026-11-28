import { Link, NavLink, useNavigate } from "react-router-dom";
import { Dropdown, message } from "antd";
import { User, LogOut, ShieldCheck, ChevronDown } from "lucide-react";

import { ASSETS_IMAGES } from "../assets/images";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();

  // 1. Lấy thông tin đăng nhập dùng chung
  const { user, checkingAuth, logout } = useAuth();

  // 2. Xác định đường dẫn bằng role thật
  const role = user?.role;

  const basePath =
    role === "ADMIN" ? "/adminuser" : role === "ARTISAN" ? "/artisan" : "/user";

  const villagePath = `${basePath}/villages`;

  // 3. Đăng xuất
  const handleLogout = async () => {
    try {
      await logout();

      message.success("Đăng xuất thành công!");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(error.message || "Đăng xuất thất bại");
    }
  };

  // 4. Menu tài khoản
  const userMenuItems = [
    {
      key: "profile",
      label: "Hồ sơ cá nhân",
      icon: <User size={16} />,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogOut size={16} />,
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "profile") {
      navigate("/profile");
    }

    if (key === "logout") {
      handleLogout();
    }
  };

  return (
    <nav className="container navbar-inner">
      {/* LOGO */}
      <Link to={basePath} className="brand" aria-label="CraftRoots Trang chủ">
        <img
          src={ASSETS_IMAGES.logo}
          alt="CraftRoots - Tinh hoa đất trời Việt"
          className="navbar-logo"
        />
      </Link>

      {/* CÁC LIÊN KẾT */}
      <div className="nav-links">
        <NavLink to={basePath} end>
          Trang chủ
        </NavLink>

        <NavLink to="/crafts">Nghề thủ công</NavLink>

        <NavLink to={villagePath}>Làng nghề</NavLink>

        <NavLink to="/artifacts">Hiện vật</NavLink>

        <NavLink to="/contact">Liên hệ</NavLink>
      </div>

      {/* TÀI KHOẢN */}
      <div className="nav-actions">
        {role === "ADMIN" && (
          <Link to="/admin" className="btn-badge-admin">
            <ShieldCheck size={15} />
            Quản trị
          </Link>
        )}

        {!checkingAuth &&
          (user ? (
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleMenuClick,
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                className="btn-outline"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <User size={18} />

                {role === "ADMIN"
                  ? "Quản trị viên"
                  : role === "ARTISAN"
                    ? "Artisan"
                    : "User"}

                <ChevronDown size={14} />
              </button>
            </Dropdown>
          ) : (
            <Link to="/login" className="btn-outline">
              Đăng nhập
            </Link>
          ))}
      </div>
    </nav>
  );
}
