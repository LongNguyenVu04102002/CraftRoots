import { refreshAccessToken } from "./authService";

import api from "./api";
const API_USER_URL = "http://localhost:5000/api/users";

// 1. Lấy thông tin tài khoản đang đăng nhập
const getMe = async () => {
  //1. Nếu ko có Access Token thì thử khôi phục
  if (!localStorage.getItem("token")) {
    await refreshAccessToken();
  }
  //2. Axious tự gửi Access Token
  //và tự Refresh khi request nhận HTTP 401
  const response = await api.get("/users/me", {
    requiresAuth: true,
  });
  //3. Lấy object user từ response Backend
  return response.data.data.user; // vì thằng Axios tự đưa JSON nhận được vào response.data khác với fetch() phải tự gọi response.json()
};

//2. Cập nhật thông tin cá nhân(Update Profile)
const updateProfile = async (values) => {
  const response = await api.patch("/users/me", values, { requiresAuth: true });
  //Xem json trả về từ backend
  console.log("PATCH Profile:", response.data);
  return response.data.data.user; // trả user mới sau khi cập nhật thành công
};

//3. Đổi mật khẩu
const changePassword = async (values) => {
  const response = await api.patch(
    "/users/me/password",
    {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    },
    { requiresAuth: true },
  );

  return response.data;
};

//4.Them API cap nhat Avatar
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file); //Khớp với .single("avatar") trong multer

  const response = await api.post("/users/me/avatar", formData, {
    requiresAuth: true, //Sử dụng cơ chế Access Token và Refresh Token đã xây dựng
  });

  return response.data.data.user;
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

export { getMe, updateProfile, changePassword, uploadAvatar, userService };
