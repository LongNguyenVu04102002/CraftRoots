import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Profile from "../pages/auth/Profile";

import Dashboard from "../pages/admin/Dashboard";

// Trang thông báo không đủ quyền
const Forbidden = () => {
  return <h2>403 - Bạn không có quyền truy cập</h2>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Trang chủ chuyển sang Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* 2. Các trang công khai */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* 3. Trang yêu cầu đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>
      {/* 4. Trang chỉ dành cho ADMIN */} {/* Truyền vào 1 prop  */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Route>
      {/* 5. Trang không đủ quyền */}
      <Route path="/403" element={<Forbidden />} />
      {/* 6. URL không tồn tại */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
