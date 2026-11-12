
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Kiểm tra có chuỗi kết nối MongoDB hay chưa
        if (!process.env.MONGO_URI) {
            throw new Error("Chưa cấu hình MONGO_URI trong file .env");
        }

        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        console.log("=================================");
        console.log("MongoDB connected successfully!");
        console.log("Database:", mongoose.connection.name);
        console.log("=================================");

    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        // Báo lỗi để server biết kết nối thất bại
        throw error;
    }
};

module.exports = connectDB;
