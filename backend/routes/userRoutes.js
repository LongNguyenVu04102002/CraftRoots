// ROUTES USER
// Khai báo URL API tài khoản và gắn từng URL với hàm trong userController.
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const {
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

//API lấy thông tin tài khoản đang đăng nhập
router.get("/me", authenticate, getMe);

//API cập nhật tài khoản
router.patch("/me", authenticate, updateProfile);

//API đổi mật khẩu
router.patch("/me/password", authenticate, changePassword);

module.exports = router;
