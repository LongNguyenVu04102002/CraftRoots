import { refreshAccessToken } from "./authService";

import api from "./api";
const API_USER_URL = "http://localhost:5000/api/users";

// 1. Lấy thông tin tài khoản đang đăng nhập
const getMe = async () => {
  // Lấy Access Token hiện tại
  let token = localStorage.getItem("token");

  // Nếu không có Access Token thì thử Refresh
  if (!token) {
    token = await refreshAccessToken();
  }

  // Hàm gửi request lấy thông tin Profile
  const requestMe = (accessToken) => {
    return fetch(`${API_USER_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  };

  // Gọi API lần đầu
  let response = await requestMe(token);

  // Nếu Access Token hết hạn hoặc không hợp lệ
  if (response.status === 401) {
    // Xin Access Token mới bằng Refresh Token
    token = await refreshAccessToken();

    // Gọi lại API với token mới
    response = await requestMe(token);
  }

  // Đọc kết quả Backend trả về
  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || "Lấy thông tin thất bại");
    error.status = response.status;
    throw error;
  }

  // Chỉ trả về object user
  return result.data.user;
};

const userService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
};

export { getMe, userService };
