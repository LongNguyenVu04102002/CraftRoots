const express = require("express");

const {
  register,
  login,
  refreshAccessToken,
  logout,
} = require("../controllers/authController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

//API đăng ký tài khoản
router.post("/register", register);
//API đăng nhập tài khoản
router.post("/login", login);
//API làm mới(refresh) Access Token
router.post("/refresh", refreshAccessToken); // ở đây ko sử dụng authenticate vì Access Token có thể đã hết hạn => Xác thực ngay trong controller
//API đăng xuất tài khoản
router.post("/logout", logout);

//API test quyền USER (học và kiểm thử, thực tế nên xóa)
router.get("/test-user", authenticate, authorize("USER"), (req, res) => {
  return res.json({
    success: true,
    message: "Bạn có quyền USER",
  });
});
//API test quyền ARTISAN (học và kiểm thử, thực tế nên xóa)
router.get(
  "/test-artisan",
  authenticate,
  authorize("ARTISAN", "ADMIN"),
  (req, res) => {
    return res.json({
      success: true,
      message: "Bạn có quyền ARTISAN",
    });
  },
);
//API test quyền ADMIN (học và kiểm thử, thực tế nên xóa)
router.get("/test-admin", authenticate, authorize("ADMIN"), (req, res) => {
  return res.json({
    success: true,
    message: "Bạn có quyền ADMIN",
  });
});

module.exports = router;
