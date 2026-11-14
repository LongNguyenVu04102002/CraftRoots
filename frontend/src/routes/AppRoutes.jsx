// KHAI BÁO ĐƯỜNG DẪN FRONTEND
// Khai báo URL và trang tương ứng; sau này bổ sung bảo vệ route theo vai trò.
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
const AppRoutes = () => {
  return (
    <Routes>
      {/* Truy cập trang chủ thì chuyển sang Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Trang đăng nhập */}
      <Route path="/login" element={<Login />} />
      {/* Trang đăng ký */}
      <Route path="/register" element={<Register />} />
      {/* URL không tồn tại thì chuyển về Login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
