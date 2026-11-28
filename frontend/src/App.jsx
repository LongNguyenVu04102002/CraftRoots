// COMPONENT GỐC
// Nhiệm vụ: kết hợp bộ định tuyến và các thành phần giao diện cấp cao.

import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";

//AuthProvider bao quanh tất cả routes, nên:
//Navbar đọc được user.
//ProtectedRoute đọc được user.
//Login cập nhật được user sau khi đăng nhập.
//Profile cập nhật được user sau khi chỉnh sửa.
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
