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

//phần xử lý upload ảnh
const fs = require("fs/promises"); //tạo thư mục, xóa file
const path = require("path"); //ghép path
const { randomUUID } = require("crypto"); //tạo tên ngẫu nhiên
const sharp = require("sharp"); //kiểm tra, resize và chuyển định dạng hình ảnh

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
        phone: req.user.phone,
        avatarUrl: req.user.avatarUrl,
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
    const { fullName, phone } = req.body;
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

    //kiểm tra 0 có thì trả luôn tránh query không cần thiết
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Không có dữ liệu cập nhật",
      });
    }
    //6. Cập nhật trong MongoDB
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    //7. Return result khi ko tìm thấy
    if (!updatedUser) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
      });
    }
    //8. Return khi tìm thấy
    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công",
      data: {
        user: {
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatarUrl: updatedUser.avatarUrl,
          role: updatedUser.role,
          accountStatus: updatedUser.accountStatus,
        },
      },
    });
  } catch (error) {
    console.error(error);
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

const uploadAvatar = async (req, res) => {
  let savedFilePath = null;
  try {
    //1. Kiểm tra Multer đã nhận đc file chưa
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ảnh đại diện",
      });
    }
    //2. Lấy dữ liệu ảnh từ RAM
    const imageBuffer = req.file.buffer;
    //3. Kiểm tra nội dung ảnh thật = Sharp
    let metadata;
    try {
      metadata = await sharp(imageBuffer, {
        limitInputPixels: 16000000, // giới hạn số pixel ảnh đầu vào mà Sharp được phép xử lý => bảo vệ bổ sung bên cạnh 3 MiB của Multer
      }).metadata();
      //mẫu của metadata{
      //   format: "png",
      //   width: 1200,
      //   height: 900,
      //   channels: 4
      // }
    } catch {
      return res.status(400).json({
        success: false,
        message: "File ảnh không hợp lệ",
      });
    }
    //Chỉ chấp nhận JPEG, PNG và WebP
    const allowedFormats = ["jpeg", "png", "webp"];

    if (
      !allowedFormats.includes(metadata.format) ||
      !metadata.width ||
      !metadata.height ||
      metadata.width > 4000 ||
      metadata.height > 4000
    ) {
      return res.status(400).json({
        success: false,
        message: "Ảnh không hợp lệ hoặc kích thước quá lớn",
      });
    }
    //4. Xác định folder lưu Avatar
    const avatarDirectory = path.join(__dirname, "..", "uploads", "avatars");
    // Tạo thư mục nếu chưa tồn tại
    await fs.mkdir(avatarDirectory, { recursive: true });
    //5. Tạo tên file mới
    const filename = `${randomUUID()}.webp`;
    savedFilePath = path.join(avatarDirectory, filename);
    //6. Xử lý và lưu ảnh
    await sharp(imageBuffer, {
      limitInputPixels: 16000000,
    })
      .rotate()
      .resize(256, 256, { fit: "cover" }) //VD người dùng nhập ảnh 2000 x 1500 px => đưa về 256x256, fit:cover là ảnh đc thu phóng và cắt bớt phần thừa ko kéo méo ảnh
      .webp({ quality: 80 }) //webp giúp giảm dung lượng so với ảnh gốc và cx ko giữ đuôi .png hay .jpg nên việc quản lý đơn giản hơn
      .toFile(savedFilePath);
    //7.Tạo đường dẫn để lưu ảnh trong MongoDB
    const avatarUrl = `/uploads/avatars/${filename}`; //mongoDB chỉ lưu đường dẫn file ảnh thật nằm trong backend/uploads/avatars

    //8.Cập nhật Avatar cho tài khoản đã xác thực
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, //từ authenticate
      { avatarUrl },
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      await fs.unlink(savedFilePath);
      savedFilePath = null;

      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }
    //9.Trả kết quả cùng cấu trúc GET Profile
    return res.status(200).json({
      success: true,
      message: "Cập nhật ảnh đại diện thành công",
      data: {
        user: {
          _id: updatedUser._id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatarUrl: updatedUser.avatarUrl,
          role: updatedUser.role,
          accountStatus: updatedUser.accountStatus,
        },
      },
    });
  } catch (error) {
    console.error(error);
    //Nếu xử lý/Lưu DB thất bại thì dọn file mới
    if (savedFilePath) {
      await fs.unlink(savedFilePath).catch(() => {});
    }
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tải ảnh đại diện",
    });
  }
};

module.exports = {
  updateProfile,
  getMe,
  changePassword,
  uploadAvatar,
};
