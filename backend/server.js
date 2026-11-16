
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const regionRoutes = require("./routes/regionRoutes");
const villageRoutes = require("./routes/villageRoutes");

const app = express();

// 1. Cho phép Frontend gọi Backend
app.use(cors());

// 2. Cho phép Backend đọc JSON
app.use(express.json());

// 3. Cho phép đọc dữ liệu từ form
app.use(express.urlencoded({ extended: true }));

// 4. Đăng ký Routes
app.use("/api", regionRoutes);
app.use("/api", villageRoutes);

// 5. Cho phép truy cập hình ảnh trong thư mục uploads
app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);

// 6. API kiểm tra server
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CraftRoots Backend is running",
        timestamp: new Date()
    });
});

// 7. Khởi động server sau khi kết nối MongoDB thành công
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(
                `CraftRoots Backend running at http://localhost:${PORT}`
            );
        });

    } catch (error) {
        console.error("Cannot start server:", error.message);
        process.exit(1);
    }
};

startServer();
