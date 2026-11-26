// KHAI BÁO ĐƯỜNG DẪN FRONTEND
// Khai báo URL; các trang được mở trực tiếp theo đường dẫn.
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Trang công khai
import Home from '../pages/home/Home';
import CraftList from '../pages/crafts/CraftList';
import CraftDetail from '../pages/crafts/CraftDetail';
import VillageList from '../pages/villages/VillageList';
import VillageDetail from '../pages/villages/VillageDetail';
import ArtifactList from '../pages/artifacts/ArtifactList';
import ArtifactDetail from '../pages/artifacts/ArtifactDetail';
import Contact from '../pages/contact/Contact';

// Hồ sơ và các trang theo nhánh URL
import Register from '../pages/auth/Register';
import Profile from '../pages/auth/Profile';

// Nghệ nhân
import ApplyArtisan from '../pages/artisan/ApplyArtisan';
import ArtisanDashboard from '../pages/artisan/ArtisanDashboard';
import ArtisanProfile from '../pages/artisan/ArtisanProfile';
import ContributionForm from '../pages/artisan/ContributionForm';

// Quản trị Admin
import Dashboard from '../pages/admin/Dashboard';
import ManageCrafts from '../pages/admin/ManageCrafts';
import ManageVillages from '../pages/admin/ManageVillages';
import ManageRegions from '../pages/admin/ManageRegions';
import ManageArtifacts from '../pages/admin/ManageArtifacts';
import ManageArtisans from '../pages/admin/ManageArtisans';
import ManageContributions from '../pages/admin/ManageContributions';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageContacts from '../pages/admin/ManageContacts';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/user" replace />} />
      {/* Giữ URL cũ cho trang quản lý tài khoản của Admin. */}
      <Route path="/users" element={<Navigate to="/admin/users" replace />} />

      {/* Tuyến giao diện công khai */}
      <Route element={<MainLayout />}>
        <Route path="/user" element={<Home basePath="/user" />} />
        <Route path="/artisan" element={<Home basePath="/artisan" />} />
        <Route path="/adminuser" element={<Home basePath="/adminuser" />} />
        <Route path="/crafts" element={<CraftList />} />
        <Route path="/crafts/:slug" element={<CraftDetail />} />
        <Route path="/user/villages" element={<VillageList villagePath="/user/villages" />} />
        <Route path="/user/villages/:slug" element={<VillageDetail backPath="/user/villages" />} />
        <Route path="/artisan/villages" element={<VillageList artisanMode villagePath="/artisan/villages" />} />
        <Route path="/artisan/villages/:slug" element={<VillageDetail backPath="/artisan/villages" />} />
        <Route path="/adminuser/village" element={<VillageList villagePath="/adminuser/village" />} />
        <Route path="/adminuser/village/:slug" element={<VillageDetail backPath="/adminuser/village" />} />
        <Route path="/adminuser/villages" element={<VillageList villagePath="/adminuser/villages" />} />
        <Route path="/adminuser/villages/:slug" element={<VillageDetail backPath="/adminuser/villages" />} />
        <Route path="/villages" element={<Navigate to="/user/villages" replace />} />
        <Route path="/villages/:slug" element={<VillageDetail backPath="/user/villages" />} />
        <Route path="/artifacts" element={<ArtifactList />} />
        <Route path="/artifacts/:slug" element={<ArtifactDetail />} />
        <Route path="/artisans/:slug" element={<ArtisanProfile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Navigate to="/user" replace />} />
        <Route path="/register" element={<Register />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/artisan/apply" element={<ApplyArtisan />} />
        <Route path="/artisan/dashboard" element={<ArtisanDashboard />} />
        <Route path="/artisan/contribute" element={<ContributionForm />} />
      </Route>

      {/* Tuyến giao diện Quản trị viên */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="crafts" element={<ManageCrafts />} />
        <Route path="regions" element={<ManageRegions />} />
        <Route path="villages" element={<ManageVillages />} />
        <Route path="artifacts" element={<ManageArtifacts />} />
        <Route path="artisans" element={<ManageArtisans />} />
        <Route path="contributions" element={<ManageContributions />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="contacts" element={<ManageContacts />} />
      </Route>
    </Routes>
  );
}
