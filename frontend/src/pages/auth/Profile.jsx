// TRANG HỒ SƠ TÀI KHOẢN
// Hiển thị và cập nhật thông tin cá nhân của người dùng đã đăng nhập.
//Lưu ý: Profile nhận dữ liệu từ ProtectedRoute, xem trong AppRoutes
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Button, message } from "antd";

// Import hàm Logout từ authService
import { logoutUser } from "../../services/authService";

const Profile = () => {
  // Nhận user từ ProtectedRoute
  const { user } = useOutletContext();

  const navigate = useNavigate();

  // State xử lý loading
  const [loading, setLoading] = useState(false);

  //Đăng xuất
  const handleLogout = async () => {
    try {
      setLoading(true);
      // Bước 1: Gọi Backend để thu hồi Refresh Token
      await logoutUser();
      // Bước 2: Xóa Access Token ở Frontend
      localStorage.removeItem("token");
      // Bước 3: Thông báo
      message.success("Đăng xuất thành công");
      // Bước 4: Chuyển về Login
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Hiển thị thông tin người dùng
  return (
    <div>
      <h2>Thông tin tài khoản</h2>
      <p>Họ tên: {user.fullName}</p>
      <p>Email: {user.email}</p>
      <p>Số điện thoại: {user.phone || "Chưa cập nhật"}</p>
      <p>Role: {user.role}</p>
      <p>Trạng thái: {user.accountStatus}</p>

      <Button danger loading={loading} onClick={handleLogout}>
        Đăng xuất
      </Button>
    </div>
  );
};

export default Profile;
