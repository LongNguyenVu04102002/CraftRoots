import { createContext, useContext, useEffect, useRef, useState } from "react";

import { getMe } from "../services/userService";
import { logoutUser } from "../services/authService";

// Tạo Context để các component dùng chung
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState("");

  const authVersion = useRef(0);

  // Kiểm tra phiên khi ứng dụng được tải lần đầu
  useEffect(() => {
    let active = true;
    const version = authVersion.current;

    const checkAuth = async () => {
      try {
        // getMe tự Refresh khi cần
        const data = await getMe();

        if (active && version === authVersion.current) {
          setUser(data);
          setAuthError("");
        }
      } catch (error) {
        if (!active || version !== authVersion.current) return;

        const status = error.status ?? error.response?.status;

        if (status === 401) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          setAuthError(error.message || "Không thể xác thực");
        }
      } finally {
        if (active) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  // Gọi sau khi Login thành công
  const signIn = (newUser) => {
    authVersion.current += 1;
    setUser(newUser);
    setAuthError("");
    setCheckingAuth(false);
  };

  // Đăng xuất dùng chung
  const logout = async () => {
    await logoutUser();

    authVersion.current += 1;
    localStorage.removeItem("token");
    setUser(null);
    setAuthError("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        checkingAuth,
        authError,
        signIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook để các component lấy dữ liệu AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }

  return context;
};
