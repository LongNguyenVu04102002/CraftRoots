// ROUTES USER
// Khai báo URL API tài khoản và gắn từng URL với hàm trong userController.
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const {
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
} = require("../controllers/userController");
// Middleware nhận file Avatar
const avatarUploadMiddleware = require("../middlewares/avatarUploadMiddleware");

//API lấy thông tin tài khoản đang đăng nhập
router.get("/me", authenticate, getMe);

//API cập nhật tài khoản
router.patch("/me", authenticate, updateProfile);

//API đổi mật khẩu
router.patch("/me/password", authenticate, changePassword);

//API upload ảnh đại diện
router.post("/me/avatar", authenticate, avatarUploadMiddleware, uploadAvatar);

module.exports = router;
