import { Navigate, Outlet } from "react-router-dom";

import { useState, useEffect } from "react";
import { getMe } from "../services/userService";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const [user, setUser] = useState(null);
  //state hien thi trang thai
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  //1. Kiểm tra đăng nhập và role người dùng trước khi cho phép render route con
  useEffect(() => {
    let active = true;
    // gọi API getMe để kiểm tra token và lấy thông tin người dùng
    const checkAuth = async () => {
      try {
        //getMe tự đọc Access Token
        //Nếu cần, nó tự gọi API Refresh
        const data = await getMe();

        if (active) {
          setUser(data);
          setAuthError("");
        }
      } catch (error) {
        if (!active) return;
        console.error(error);
        if (error.status === 401) {
          //Ko thể xác thực hoặc Refresh thất bại
          localStorage.removeItem("token");
          setUser(null);
        } else {
          //Lỗi mạng or lỗi server
          setAuthError(error.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => {
      active = false; // Bỏ qua kết quả API nếu effect đã được cleanup
      //active = false không hủy request hay tự ngăn mọi memory leak.
      //  Nó chỉ giúp bạn không cập nhật state bằng kết quả của một effect đã hết hiệu lực.
    };
  }, []); // chạy đúng 1 lần khi component mount
  //Thực thi hàm trên luôn

  //3. Đang kiểm tra đăng nhập
  if (loading) {
    return <p>Đang kiểm tra đăng nhập</p>;
  }

  //4. Lỗi API: ko tự coi lỗi mạng là chưa đăng nhập
  if (authError) {
    // tải toàn bộ lại trang nếu ấn nút
    return (
      <div>
        <p>Không thể xác thực: {authError}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  //5. Không có user
  if (!user) {
    return <Navigate to="/login"></Navigate>;
  }

  //6. Không đủ role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace></Navigate>;
  }

  //7. Đủ điều kiện, hiện thị route con
  return <Outlet context={{ user }}></Outlet>;
};

export default ProtectedRoute;
