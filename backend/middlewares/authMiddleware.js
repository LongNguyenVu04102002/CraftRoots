// MIDDLEWARE XÁC THỰC VÀ PHÂN QUYỀN
// Dự kiến: đọc JWT, xác minh người dùng, gắn thông tin user vào request,
// kiểm tra vai trò USER/ARTISAN/ADMIN trước khi cho phép truy cập API.
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

//1. Middleware xác thực JWT và gắn thông tin user vào request
const authenticate = async (req, res, next) => {
  try {
    //lấy Authorization từ header, VD: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    //kiểm tra Bearer token có tồn tại và đúng định dạng
    if (
      typeof authHeader !== "string" ||
      !authHeader.startsWith("Bearer ") // bắt đầu với "Bearer "
    ) {
      return res.status(401).json({
        success: false,
        // lúc sau đổi message thành "Vui lòng đăng nhập để tiếp tục"
        message: "Token không hợp lệ or không được cung cấp",
      });
    }
    //Tách token khỏi header
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }
    //Viết xong đoạn này mới kiểm tra xem request có token hay ko, và có gửi theo đúng định dạng Bearer hay ko
    //=> Chưa xác minh token có hợp lệ hay ko

    //2. Xác minh JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    //Ví dụ decoded có thể chứa
    //{
    // "userId": "6af4ead59d29ee70c578f544", ID tài khoản cho vào payload
    // "iat": 1790000000, thời điểm JWT được tạo ra
    // "exp": 1790604800 thời điểm JWT hết hạn
    // }
    //3. Kiểm tra userId có hợp lệ không
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }
    //4. Tìm user trong database dựa vào userId từ decoded
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }
    //5. Kiểm tra accountStatus của user xem có phải là ACTIVE ko
    if (user.accountStatus !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản bị DISABLED or BLOCKED, không được phép truy cập",
      });
    }
    //6. Gắn user vào req
    //sau bước Xác minh JWT và tìm user thành công, backend đã biết người gửi request là ai, có quyền truy cập API hay ko
    //Nhưng biến user chỉ tồn tại trong middleware này, muốn các controller khác dùng thì cần gắn vào req.user
    req.user = user;
    //7. gọi next() - nếu ko gọi thì request sẽ bị treo ở middleware, ko đi tiếp đến controller
    next();
  } catch (error) {
    //error lấy từ jwt.verify nếu token ko hợp lệ or hết hạn throw ra error
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn, vui lòng đăng nhập lại",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }
    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};
//2. Middleware phân quyền(theo role USER/ARTISAN/ADMIN)
const authorize = (...roles) => {
  //Vì muốn truyền role vào trước, sau đó Express mới thực thi middleware với req,res,next khi có request
  return (req, res, next) => {
    //Đảm bảo req.user đã được gắn bởi middleware authenticate trước đó
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để tiếp tục",
      });
    }
    //Kiểm tra role của user có nằm trong roles được phép truy cập ko
    if (!roles.includes(req.user.role)) {
      // includes: kiểm tra phần tử có nằm trong mảng ko array.includes(value) Đúng - true, Sai - false
      return res.status(403).json({
        // 403-forbidden
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }
    //Đủ quyền thì cho đi tiếp
    next();
  };
};

module.exports = { authenticate, authorize };
