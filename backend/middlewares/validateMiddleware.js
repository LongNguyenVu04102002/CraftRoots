const bcrypt = require("bcryptjs");

//I. Kiểm tra dữ liệu đăng ký
const validateRegister = (req, res, next) => {
  const { fullName, email, password, confirmPassword, phone } = req.body || {};

  //Validate data
  if (
    typeof fullName !== "string" || // kiểm tra kiểu dữ liệu và chuỗi rỗng
    !fullName.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
    });
  }
  //Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Email không hợp lệ",
    });
  }
  //Check password length
  if (password.length < 8 || bcrypt.truncates(password)) {
    return res.status(400).json({
      success: false,
      message: "Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte UTF-8",
    });
  }
  //Check confirmPassword
  if (password !== confirmPassword) {
    return res.status(400).jsson({
      success: false,
      message: "Mật khẩu xác nhận không khớp",
    });
  }
  //Dữ liệu hợp lệ sẽ chuyển sang Controller
  next(); //nếu thiếu next nó sẽ bị treo ở middleware
};
//II. Kiểm tra dữ liệu đăng ký
const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  //Validate data
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập email và mật khẩu",
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};
