//Xử lý logic đăng ký, xử lý logic đăng nhập, đăng xuất, đổi mật khẩu, quên mật khẩu, làm mới token(refresh token)
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//I. Đăng ký tài khoản(register)
const register = async (req, res) => {
  try {
    //Dữ liệu đã được validateRegister kiểm tra
    //1. Lấy data từ frontend
    const { fullName, email, password, confirmPassword, phone } = req.body;

    //2. Chuẩn hóa email
    const normalizedEmail = email.trim().toLowerCase();
    //3. Kiểm tra email đã tồn tại hay chưa
    const existingUser = await User.exists({
      // hàm ktra tồn tại bên DB với ĐK
      email: normalizedEmail,
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }
    //4. Mã hóa mật khẩu(hash password)
    const passwordHash = await bcrypt.hash(password, 12); // hash thì cần await hashSync ko cần. hashSync chặn luồng của JS, các request có thể bị chậm
    //5. Lưu tài khoản vào MongoDB
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash: passwordHash,
      phone: phone,
    });
    //6. Trả kết quả đăng ký
    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công",
      data: {
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          accountStatus: newUser.accountStatus,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    //Xử lý lỗi email trùng từ MongoDB
    if (error.code === 11000) {
      // mongoose unique index
      return res.status(409).json({
        success: false,
        message: "Email đã được đăng ký",
      });
    }
    if (error.name === "ValidationError") {
      //mongoose validate
      console.log("Lỗi Validation:", error.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đăng ký không hợp lệ",
      });
    }
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
  //   console.log(req.body);
  //   return res.status(200).json("hello world");
};
//II. Đăng nhập tài khoản (login)
const login = async (req, res) => {
  try {
    //Dữ liệu đã được validateLogin kiểm tra
    //1. Lấy dữ liệu từ frontend
    const { email, password } = req.body;

    //2. Chuẩn hóa email
    const normalizedEmail = email.trim().toLowerCase();
    //3. Tìm user và lấy thêm field passwordHash đã loại bỏ ở User Model
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+passwordHash"); // bên User Model select:false giúp ẩn field thì bây giờ mình cần add lại
    //4. Kiểm tra tài khoản tồn tại
    if (!user) {
      return res.status(401).json({
        success: false,
        //kiểm tra tồn tại nhưng ghi "Email hoặc mật khẩu không chính xác" vì
        //=> Ko muốn người lạ biết email nào đã đăng ký trên hệ thống hạn chế việc dò tìm tài khoản
        message: "Email hoặc mật khẩu không chính xác",
      });
    }
    //5. So sánh mật khẩu bằng bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác",
      });
    }
    //6. Kiểm tra trạng thái tài khoản(accountStatus:["ACTIVE","BLOCKED","DISABLED"])
    if (user.accountStatus !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản không được phép đăng nhập",
      });
    }
    //7. Tạo JWT 3 tham số jwt.sign(payload, secretOrPrivateKey, options);
    const token = jwt.sign(
      { userId: user._id.toString() }, //dữ liệu muốn chứa trong token, cần chuyển toString vì _id là kiểu ObjectId
      process.env.JWT_SECRET, //khóa bí mật dùng để ký token,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }, //option tùy chọn chọn số ngày sống của token 1d = 1 day, 15m = 15minutes, 1h = 1 hour
      //Chưa đưa ROLE vào để middleware có thể lấy quyền mới nhất từ MongoDB, tránh phụ thuộc vào role cũ trong JWT
    );
    //8. Cập nhật thời gian đăng nhập gần nhất (user.lastLoginAt đã set trong model)
    user.lastLoginAt = new Date();
    await user.save();
    //10. Trả kết quả đăng nhập
    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          accountStatus: user.accountStatus,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
        },
        token: token, // trả về 1 chuỗi string đã tạo trước đó
        //chứa 3 phần Header(thông tin thuật toán), Payload(thông tin user và expiry date), Signature(chữ ký xác thực kiểm tra token có bị giả mạo k)
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

module.exports = { register, login };

//200 OK – Thành công
//201 Created – Tạo mới thành công
//400 Bad Request – Dữ liệu không hợp lệ
//401 Unauthorized – Chưa xác thực hợp lệ
//403 Forbidden – Không có quyền
//404 Not Found – Không tìm thấy
//409 Conflict – Xung đột dữ liệu
//500 Internal Server Error – Lỗi server
