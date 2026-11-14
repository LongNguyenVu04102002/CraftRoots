const express = require("express");

const { register, login } = require("../controllers/authController");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const {
  validateRegister,
  validateLogin,
} = require("../middlewares/validateMiddleware");

const router = express.Router();

//API đăng ký tài khoản
router.post("/register", validateRegister, register);
//API đăng nhập tài khoản
router.post("/login", validateLogin, login);

//API lấy thông tin tài khoản đang đăng nhập
router.get("/me", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Lấy thông tin tài khoản thành công",
    data: {
      user: {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        accountStatus: req.user.accountStatus,
      },
    },
  });
});
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
