// XỬ LÝ NGHIỆP VỤ TÀI KHOẢN
// cho phép người dùng xem, chỉnh sửa hồ sơ: họ tên, số điện thoại, ảnh đại diện
// sử dụng userController.js, userRoutes.js, userService.js
// gửi đơn trở thành nghệ nhân và xử lý đơn đăng ký (phối hợp Admin).
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  validateUpdateProfile,
  validateChangePassword,
} = require("../services/validationService");

//Lấy thông tin tài khoản
const getMe = (req, res) => {
  //đã qua middleware authenticate nên req.user đã có thông tin user
  const user = req.user; //
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
};

//Cập nhật thông tin Profile
const updateProfile = async (req, res) => {
  try {
    //1.Lấy userId từ middleware authenticate
    const userId = req.user._id;
    //2. Lấy dữ liệu từ frontend gửi lên
    const { fullName, phone, avatarUrl } = req.body;
    //3. Validate data = hàm validateUpdateProfile
    const error = validateUpdateProfile(req.body);
    if (error) {
      // tức là có lỗi, null là ko có lỗi
      return res.status(400).json({ message: error }); //đã return error lỗi string nên lấy luôn
    }
    //4. Tạo dữ liệu cập nhật
    const updates = {};

    //5. Trường hợp ko gửi đủ field thì field đó thành undefine nên cần kiểm tra mới đc gán
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl.trim();

    //6. Cập nhật trong MongoDB
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
    //7.Lấy danh sách các key sau đó .length đếm số key
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Không có dữ liệu cập nhật",
      });
    }
    //7. Return result khi ko tìm thấy
    if (!updatedUser) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }
    //8. Return khi tìm thấy
    return res.status(200).json({
      message: "Cập nhật thành công",
      updatedUser,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

//Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    //1.Lấy userId từ middleware authenticate(authenticate đã biết ai đang đăng nhập)
    const userId = req.user._id;
    //2. Nhận 2 biến từ frontend
    const { currentPassword, newPassword } = req.body;
    //3. gọi validateChangePassword
    const error = validateChangePassword(req.body);
    if (error) {
      return res.status(400).json({
        message: error,
      });
    }
    //4. Tìm user và kiểm tra mật khẩu cũ
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    //5. Kiểm tra mật khẩu hiện tại(currentPassword) có đúng ko
    // compare(plainPassword,hashedPassword) ko được đổi vị trí
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại không chính xác" });
    }
    //6. Băm và lưu mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    //7. Gán mật khẩu mới vào user hiện tại
    user.passwordHash = hashedNewPassword;
    //8. Lưu vào MongoDB
    await user.save();
    //9. Trả về kết quả thành công cho frontend
    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  updateProfile,
  getMe,
  changePassword,
};
