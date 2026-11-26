// KHAI BÁO ĐƯỜNG DẪN FRONTEND
// Các trang theo vai trò được mở trực tiếp bằng URL; xác thực do module khác phụ trách.
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/home/Home';
import VillageList from '../pages/villages/VillageList';
import VillageDetail from '../pages/villages/VillageDetail';
import ManageRegions from '../pages/admin/ManageRegions';
import ManageVillages from '../pages/admin/ManageVillages';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/user" replace />} />

      <Route element={<MainLayout />}>
        <Route path="/user" element={<Home basePath="/user" />} />
        <Route path="/artisan" element={<Home basePath="/artisan" />} />
        <Route path="/adminuser" element={<Home basePath="/adminuser" />} />

        <Route path="/user/villages" element={<VillageList villagePath="/user/villages" />} />
        <Route path="/user/villages/:slug" element={<VillageDetail backPath="/user/villages" />} />
        <Route path="/artisan/villages" element={<VillageList artisanMode villagePath="/artisan/villages" />} />
        <Route path="/artisan/villages/:slug" element={<VillageDetail backPath="/artisan/villages" />} />
        <Route path="/adminuser/villages" element={<VillageList villagePath="/adminuser/villages" />} />
        <Route path="/adminuser/villages/:slug" element={<VillageDetail backPath="/adminuser/villages" />} />
        <Route path="/adminuser/village" element={<Navigate to="/adminuser/villages" replace />} />
        <Route path="/villages" element={<Navigate to="/user/villages" replace />} />
        <Route path="/login" element={<Navigate to="/user" replace />} />
        <Route path="/register" element={<Navigate to="/user" replace />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="villages" replace />} />
        <Route path="regions" element={<ManageRegions />} />
        <Route path="villages" element={<ManageVillages />} />
      </Route>
    </Routes>
  );
}
