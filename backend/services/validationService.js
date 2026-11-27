const bcrypt = require("bcryptjs");
const { z } = require("zod");

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
const updateProfileSchema = z
  .object({
    //1. Kiểm tra họ tên
    fullName: z
      .string()
      .trim()
      .max(50, "Họ tên không được vượt quá 50 ký tự")
      .regex(
        /^[\p{L}\p{M}\s.'-]+$/u,
        "Họ tên không được chứa số hoặc ký tự đặc biệt không hợp lệ",
      )
      .optional(),
    //2. Kiểm tra số điện thoại
    phone: z
      .string()
      .trim()
      .refine((value) => value === "" || /^0\d{9}$/.test(value), {
        message: "Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Không có dữ liệu cập nhật",
  });
//hàm controller sẽ gọi
const validateUpdateProfile = (data) => {
  const result = updateProfileSchema.safeParse(data);

  if (!result.success) {
    return result.error.issues[0].message;
  }

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
