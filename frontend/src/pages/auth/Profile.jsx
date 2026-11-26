// TRANG HỒ SƠ TÀI KHOẢN
// Hiển thị và cập nhật thông tin cá nhân của người dùng đã đăng nhập.
//Lưu ý: Profile nhận dữ liệu từ ProtectedRoute, xem trong AppRoutes
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button } from "antd";

const Profile = () => {
  // Nhận user từ ProtectedRoute
  const { user } = useOutletContext();

  const navigate = useNavigate();

  //1. đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  // 2. Hiển thị thông tin người dùng
  return (
    <div>
      <h2>Thông tin tài khoản</h2>
      <p>Họ tên: {user.fullName}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Trạng thái: {user.accountStatus}</p>

      <Button danger onClick={handleLogout}>
        Đăng xuất
      </Button>
    </div>
  );
};

export default Profile;
