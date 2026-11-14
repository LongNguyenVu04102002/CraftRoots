// FILE KHỞI ĐỘNG BACKEND
// Nhiệm vụ dự kiến:
// - Đọc cấu hình môi trường.
// - Khởi tạo Express.
// - Cấu hình middleware dùng chung (JSON, CORS, static uploads).
// - Kết nối MongoDB thông qua config/db.js.
// - Đăng ký tất cả routes của dự án.
// - Khởi động server.

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

// 1. Cho phép Frontend gọi Backend
app.use(cors());

// 2. Cho phép Backend đọc dữ liệu JSON
app.use(express.json());

// 3. Cho phép đọc dữ liệu từ form
app.use(express.urlencoded({ extended: true }));

//7. routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth/", authRoutes);

// 4. Cho phép truy cập hình ảnh trong thư mục uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 5. API kiểm tra server
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CraftRoots Backend is running",
    timestamp: new Date(),
  });
});

// 6. Khởi động server sau khi kết nối MongoDB thành công
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`CraftRoots Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Cannot start server:", error.message);
    process.exit(1);
  }
};

startServer();
