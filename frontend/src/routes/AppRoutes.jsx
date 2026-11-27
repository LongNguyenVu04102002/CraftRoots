// KHAI BÁO ĐƯỜNG DẪN FRONTEND
// Khai báo URL và trang tương ứng; sau này bổ sung bảo vệ route theo vai trò.
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Profile from "../pages/auth/Profile";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/home/Home";
import VillageList from "../pages/villages/VillageList";
import VillageDetail from "../pages/villages/VillageDetail";
import ManageRegions from "../pages/admin/ManageRegions";
import ManageVillages from "../pages/admin/ManageVillages";

import Dashboard from "../pages/admin/Dashboard";

// Trang thông báo không đủ quyền
const Forbidden = () => {
  return <h2>403 - Bạn không có quyền truy cập</h2>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Authentication */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* 2. Trang yêu cầu đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
      </Route>
      {/* 3. Giao diện tra cứu làng nghề */}
      <Route element={<MainLayout />}>
        {/* Trang chủ */}
        <Route path="/user" element={<Home basePath="/user" />} />
        <Route path="/artisan" element={<Home basePath="/artisan" />} />
        <Route path="/adminuser" element={<Home basePath="/adminuser" />} />

        {/* USER */}
        <Route
          path="/user/villages"
          element={<VillageList villagePath="/user/villages" />}
        />
        <Route
          path="/user/villages/:slug"
          element={<VillageDetail backPath="/user/villages" />}
        />

        {/* ARTISAN */}
        <Route
          path="/artisan/villages"
          element={<VillageList artisanMode villagePath="/artisan/villages" />}
        />
        <Route
          path="/artisan/villages/:slug"
          element={<VillageDetail backPath="/artisan/villages" />}
        />

        {/* ADMIN - Giao diện tra cứu công khai */}
        <Route
          path="/adminuser/villages"
          element={<VillageList villagePath="/adminuser/villages" />}
        />
        <Route
          path="/adminuser/villages/:slug"
          element={<VillageDetail backPath="/adminuser/villages" />}
        />
      </Route>

      {/* 4. Chuyển hướng nếu nhập URL số ít */}
      <Route
        path="/artisan/village"
        element={<Navigate to="/artisan/villages" replace />}
      />
      <Route
        path="/adminuser/village"
        element={<Navigate to="/adminuser/villages" replace />}
      />
      <Route
        path="/villages"
        element={<Navigate to="/user/villages" replace />}
      />
      {/* 5. Khu vực quản trị - chỉ ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />

          <Route path="regions" element={<ManageRegions />} />

          <Route path="villages" element={<ManageVillages />} />
        </Route>
      </Route>

      {/* 6. Xử lý lỗi */}
      <Route path="/403" element={<Forbidden />} />

      { /*<Route path="*" element={<Navigate to="/login" replace />} /> */}
    </Routes>
  );
};

export default AppRoutes;
