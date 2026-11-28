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
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");

const app = express();

// 1. Cho phép Frontend gọi Backend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// 2. Cho phép Backend đọc dữ liệu JSON
app.use(express.json());
// 8. Cho phép đọc cookie từ client
app.use(cookieParser());

// 3. Cho phép đọc dữ liệu từ form
app.use(express.urlencoded({ extended: true }));

// 4. Cho phép truy cập hình ảnh trong thư mục uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 7. routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth/", authRoutes);

const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

const craftDirectoryRoutes = require("./routes/craftDirectoryRoutes");
app.use("/api/public/craft-directories", craftDirectoryRoutes);


const {
    publicRouter: publicCraftRoutes,
    adminRouter: adminCraftRoutes,
} = require("./routes/craftRoutes");

// API công khai
app.use("/api/public/crafts", publicCraftRoutes);

// API quản trị
app.use("/api/admin/crafts", adminCraftRoutes);


const villageRoutes = require("./routes/villageRoutes");
app.use("/api", villageRoutes);

const regionRoutes = require("./routes/regionRoutes");
app.use("/api", regionRoutes);

const locationRoutes = require("./routes/locationRoutes");
app.use("/api/locations", locationRoutes);

const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

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
