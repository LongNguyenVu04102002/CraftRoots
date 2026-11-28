const multer = require("multer");

// 1. Các định dạng ảnh cho phép
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

// 2. Cấu hình Multer cho Avatar
const uploadAvatar = multer({
  // Giữ ảnh tạm trong RAM Backend
  storage: multer.memoryStorage(),

  // Giới hạn dung lượng 3 MiB và 1 file MiB: Mebibyte-tính theo hệ nhị phân(máy dùng) MB theo hệ thập phân
  limits: {
    fileSize: 3 * 1024 * 1024,
    files: 1,
  },

  // Kiểm tra MIME type sơ bộ
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP"));
    }

    callback(null, true);
  },
}).single("avatar");

// 3. Middleware dùng trong Express Route
const avatarUploadMiddleware = (req, res, next) => {
  uploadAvatar(req, res, (error) => {
    // Có lỗi trong quá trình nhận ảnh
    if (error) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Ảnh đại diện không được vượt quá 3 MiB"
          : error.message || "Không thể tải ảnh lên";

      return res.status(status).json({
        success: false,
        message,
      });
    }

    // Nhận file thành công, cho đi tiếp
    next();
  });
};

module.exports = avatarUploadMiddleware;
