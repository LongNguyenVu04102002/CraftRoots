// BỐ CỤC TRANG QUẢN TRỊ
// Bao gồm menu Admin, thanh tiêu đề và khu vực nội dung quản trị.
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div>
      {/* Sidebar, Header hiện tại của nhóm */}

      <main>
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;
