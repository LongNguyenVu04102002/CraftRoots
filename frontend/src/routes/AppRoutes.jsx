// KHAI BÁO ĐƯỜNG DẪN FRONTEND
// Khai báo URL và trang tương ứng; sau này bổ sung bảo vệ route theo vai trò.
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

// Xác thực & Hồ sơ
import Login from '../pages/auth/Login';
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

const ProtectedRoute = ({ children, allowedRoles }) => {
  const raw = localStorage.getItem('craftroots_user');
  const user = raw ? JSON.parse(raw) : null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Tuyến giao diện công khai */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/crafts" element={<CraftList />} />
        <Route path="/crafts/:slug" element={<CraftDetail />} />
        <Route path="/villages" element={<VillageList />} />
        <Route path="/villages/:slug" element={<VillageDetail />} />
        <Route path="/artifacts" element={<ArtifactList />} />
        <Route path="/artifacts/:slug" element={<ArtifactDetail />} />
        <Route path="/artisans/:slug" element={<ArtisanProfile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artisan/apply"
          element={
            <ProtectedRoute>
              <ApplyArtisan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artisan/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ARTISAN', 'ADMIN']}>
              <ArtisanDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artisan/contribute"
          element={
            <ProtectedRoute allowedRoles={['ARTISAN', 'ADMIN']}>
              <ContributionForm />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Tuyến giao diện Quản trị viên */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
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
