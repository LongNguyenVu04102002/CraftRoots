const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { randomUUID } = require("crypto");

const uploadDirectory = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedImageTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${allowedImageTypes[file.mimetype] || ".img"}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes[file.mimetype]) {
      const error = new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
}).single("file");

const uploadVillageImage = (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : error.status || 400;
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
