const bcrypt = require("bcryptjs");

//I. Kiểm tra dữ liệu đăng ký
const validateRegister = (data) => {
  const { fullName, email, password, confirmPassword, phone } = data || {};

  //Validate data
  if (
    typeof fullName !== "string" || // kiểm tra kiểu dữ liệu và chuỗi rỗng
    !fullName.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  )
    return "Vui lòng nhập đầy đủ thông tin bắt buộc";
  //Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Email không hợp lệ";
  }
  //Check password length
  if (password.length < 8 || bcrypt.truncates(password))
    return "Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte UTF-8";
  //Check confirmPassword
  if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp";

  return null;
};
//II. Kiểm tra dữ liệu đăng nhập
const validateLogin = (data) => {
  const { email, password } = data || {};
  //Validate data
  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  )
    return "Vui lòng nhập email và mật khẩu";

  // nếu ko có lỗi
  //services chỉ có trách nhiệm kiểm tra và thông báo kết quả, ko tự trả HTTP 400, ko tự gọi next() và ko lưu db
  return null;
};

//III. Kiểm tra dữ liệu lúc ấn cập nhật hồ sơ
const validateUpdateProfile = (data) => {
  const { fullName, phone, avatarUrl } = data || {};
  //Kiểm tra fullName
  if (fullName !== undefined) {
    if (typeof fullName !== "string" || !fullName.trim()) {
      return "Họ tên không hợp lệ";
    }
  }
  //Kiểm tra phone
  if (phone !== undefined) {
    if (typeof phone !== "string") {
      return "Số điện thoại không hợp lệ";
    }
  }
  //Kiểm tra avatarUrl
  if (avatarUrl !== undefined) {
    if (typeof avatarUrl !== "string") {
      return "Đường dẫn ảnh không hợp lệ";
    }
  }
  //nếu ko có lỗi
  return null;
};

//IV. Kiểm tra dữ liệu lúc đổi mật khẩu
const validateChangePassword = (data) => {
  const { currentPassword, newPassword } = data || {};

  //1. Kiểm tra data và rỗng
  if (
    typeof currentPassword !== "string" ||
    !currentPassword ||
    typeof newPassword !== "string" ||
    !newPassword
  ) {
    return "Vui lòng nhập đầy đủ mật khẩu";
  }
  //2. Kiểm tra độ dài mật khẩu mới
  if (newPassword.length < 8 || bcrypt.truncates(newPassword)) {
    return "Mật khẩu mới phải có ít nhất 8 ký tự và không vượt quá 72 byte UTF-8";
  }
  //không có lỗi
  return null;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
};
