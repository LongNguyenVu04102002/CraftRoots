// MIDDLEWARE UPLOAD FILE
// Dự kiến: cấu hình Multer để nhận ảnh/video, giới hạn dung lượng,
// kiểm tra định dạng và lưu file vào backend/uploads.
const fs = require("fs"); //thao tác file và thư mục
const path = require("path"); // xử lý path thư mục
const multer = require("multer"); // nhận file qua multipart/form-data
const { randomUUID } = require("crypto"); // sinh tên file ngẫu nhiên, giảm khả năng trùng file

const uploadDirectory = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true }); //tạo thư mục uploads nếu chưa tồn tại, recursive: true giúp tạo các thư mục cha cần thiết và không báo lỗi vì thư mục đã tồn tại

const allowedImageTypes = {
  // các định dạng cho phép
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const upload = multer({
  storage: multer.diskStorage({
    //destination quyết định nơi lưu ảnh
    destination: (_req, _file, callback) => callback(null, uploadDirectory), // tham số đầu là dành cho lỗi, tham số sau là kết quả
    //filename tên file
    filename: (_req, file, callback) => {
      callback(
        null,
        `${randomUUID()}${allowedImageTypes[file.mimetype] || ".img"}`,
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes[file.mimetype]) {
      // file.mimetype kiểm tra loại file => vì đây là thông tin đc client cung cấp, chưa chứng minh file là ảnh => rủi ro bảo mật
      const error = new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
}).single("file"); // nhận 1 file duy nhất ở field có tên "file"

const uploadVillageImage = (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      const status =
        error.code === "LIMIT_FILE_SIZE" ? 413 : error.status || 400;
      return res.status(status).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Ảnh không được vượt quá 5 MB."
            : error.message || "Không thể tải ảnh lên.",
      });
    }

    next();
  });
};

module.exports = uploadVillageImage;
