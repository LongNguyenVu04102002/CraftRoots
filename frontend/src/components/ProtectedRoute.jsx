import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  // Nhận trạng thái xác thực từ Context
  const { user, setUser, checkingAuth, authError } = useAuth();

  // 1. Đang kiểm tra phiên đăng nhập
  if (checkingAuth) {
    return <p>Đang kiểm tra đăng nhập...</p>;
  }

  // 2. Lỗi mạng hoặc lỗi server
  if (authError) {
    return <p>Không thể xác thực: {authError}</p>;
  }

  // 3. Chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 4. Không đủ quyền truy cập
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // 5. Cho phép truy cập trang con
  return <Outlet context={{ user, setUser }} />;
};

export default ProtectedRoute;
