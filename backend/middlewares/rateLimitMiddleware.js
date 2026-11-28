const { rateLimit } = require("express-rate-limit");

//1. Giới hạn API Register
const registerLimiter = rateLimit({
  //Khoảng thời gian: test 1 phút, thực tế nên để 15p
  windowMs: 60 * 1000,
  //Tối đa 5 request trong khoảng thời gian trên
  limit: 5,
  //Trả thông tin giới hạn trong Response Headers
  standardHeaders: "draft-8",
  legacyHeaders: false,
  //Thông báo khi vượt giới hạn
  message: {
    success: false,
    message: "Đăng ký quá nhiều lần, vui lòng thử lại sau ít phút",
  },
});

//2. Giới hạn API Login
const loginLimiter = rateLimit({
  //Khoảng thời gian
  windowMs: 60 * 1000,
  limit: 10,
  //Không tính request đăng nhập thành công
  skipSuccessfulRequests: true, //nó dựa trên HTTP status trả về
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau.",
  },
});

module.exports = {
  registerLimiter,
  loginLimiter,
};
