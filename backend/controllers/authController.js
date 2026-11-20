//Xử lý logic đăng ký, xử lý logic đăng nhập, đăng xuất, đổi mật khẩu, quên mật khẩu, làm mới token(refresh token)
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//Module có sẵn của Node.js, tạo chuỗi token ngẫu nhiên và băm token
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");
// import validation từ services
const {
  validateRegister,
  validateLogin,
} = require("../services/validationService");

//I. Đăng ký tài khoản(register)
const register = async (req, res) => {
  try {
    //gọi service để kiểm tra dữ liệu đầu vào
    const errorMessage = validateRegister(req.body);
    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
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
    //gọi service để kiểm tra dữ liệu đầu vào
    const errorMessage = validateLogin(req.body);
    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
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
    //Tạo accessToken
    const accessToken = jwt.sign(
      { userId: user._id.toString() }, //dữ liệu muốn chứa trong token, cần chuyển toString vì _id là kiểu ObjectId
      process.env.JWT_SECRET, //khóa bí mật dùng để ký token,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }, //option tùy chọn chọn số ngày sống của token 1d = 1 day, 15m = 15minutes, 1h = 1 hour
      //Chưa đưa ROLE vào để middleware có thể lấy quyền mới nhất từ MongoDB, tránh phụ thuộc vào role cũ trong JWT
    );
    //8. Cập nhật thời gian đăng nhập gần nhất (user.lastLoginAt đã set trong model)
    user.lastLoginAt = new Date();
    await user.save();
    //Bổ sung đoạn này làm Refresh Token
    //Tạo Refresh Token ngẫu nhiên
    const refreshToken = crypto.randomBytes(64).toString("hex"); // Tạo 64 byte ngẫu nhiên có độ bảo mật cao sau đó chuyển sang chuỗi hex
    //Băm RefreshToken trước khi lưu DB
    const tokenHash = crypto
      .createHash("sha256") //sha256 phù hợp việc lưu và tra cứu bản hash của token này
      .update(refreshToken)
      .digest("hex");
    //Thiết lập thời gian hết hạn 7 ngày
    const refreshMaxAge = 7 * 24 * 60 * 60 * 1000; //tinh bang mili giay
    const expiresAt = new Date(Date.now() + refreshMaxAge);
    //Lưu thông tin Refresh Token vào MongoDB
    await RefreshToken.create({
      userId: user._id,
      tokenHash: tokenHash,
      expiresAt: expiresAt,
    });
    //Gửi Refresh Token về trình duyệt(client) qua cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, //JS Frontend ko thể đọc trực tiếp qua cookie (document.cookie="" rỗng)
      secure: process.env.NODE_ENV === "production", //Chỉ gửi qua HTTPS, ở đây là production thì bật lên development có thể tắt đi
      sameSite: "lax", //Giới hạn 1 số trường hợp gửi cookie giữa các site(có "strict","none" nữa)
      //Khi triển khai khác domain(tên miền), xem lại SameSite, HTTPS và bảo vệ CSRF
      path: "/api/auth", //Cookie đc gửi đến các API thuộc /api/auth tức là có thể áp dụng với /api/auth/123456 ...vv
      maxAge: refreshMaxAge, // Thời gian sống 7 ngày
    });
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
        token: accessToken, // trả về 1 chuỗi string đã tạo trước đó
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

//III. Làm mới Access Token
// Hiện tại Refresh Token cũ tiếp tục được sử dụng đến khi hết hạn or bị revoke
// Sau này có thể phát triển thêm Refresh Token Rotation => tăng bảo mật
const refreshAccessToken = async (req, res) => {
  try {
    //1. Lấy Refresh Token từ cookie
    const refreshToken = req.cookies?.refreshToken; // ?.(Optional Chaining - Truy cập chuỗi tùy chọn)
    //Lấy thuộc tính bên trong object mà ko sợ bị văng or sập server khi Object null or undefined(ở đây chính là kiểm tra req.cookies)
    if (!refreshToken) {
      return res.status(401).json({
        message: "Không tìm thấy Refresh Token",
      });
    }
    //2. Băm Refresh Token để đối chiếu trong MongoDB
    const tokenHash = crypto
      .createHash("sha256") // băm 2 lần cùng 1 token với SHA-256, kết quả sẽ giống nhau =>Từ đó đối chiếu đc trong db
      .update(refreshToken)
      .digest("hex");
    //3. Tìm Refresh Token trong database xem có còn hiệu lực ko
    const storedToken = await RefreshToken.findOne({
      tokenHash: tokenHash, //check xem có = refresh token băm ở trên ko
      revokedAt: null, //Token chưa bị thu hồi thì thỏa mãn
      expiresAt: { $gt: new Date() }, // thời gian hết hạn phải lớn hơn thời điểm hiện tại
    });
    if (!storedToken) {
      return res.status(401).json({
        message: "Refresh Token không hợp lệ hoặc hết hạn",
      });
    }
    //4. Tìm user sở hữu Refresh Token
    const user = await User.findById(storedToken.userId); // field userId mình đã liên kết với bảng User
    if (!user || user.accountStatus !== "ACTIVE") {
      // ko tồn tại or blocked or disabled
      return res.status(401).json({
        message: "Tài khoản không hợp lệ",
      });
    }
    //5. Tạo Access Token mới
    const accessToken = jwt.sign(
      { userId: user._id.toString() }, //payload
      process.env.JWT_SECRET, //chu ky or JWT_SECRET
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }, //Thời gian sống
    );
    //6. Trả Access Token mới
    return res.status(200).json({
      message: "Làm mới Access Token thành công",
      data: {
        token: accessToken,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};

const logout = async (req, res) => {
  try {
    //vì logout nên ta phải thu hồi refresh token tránh dùng refresh token để vào lại
    //1. Lấy Refresh Token từ cookie
    const refreshToken = req.cookies?.refreshToken;
    //2. Nếu có thì thu hồi trong DB
    if (refreshToken) {
      //Băm Refresh Token để so sánh trong DB
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      //3. Cập nhật trạng thái thu hồi
      await RefreshToken.updateOne(
        { tokenHash: tokenHash, revoked: null },
        { $set: { revokedAt: new Date() } }, // thu hồi ngay hiện tại => API Refresh sẽ ko tìm thấy token hợp lệ nữa=> Ko thể tạo Access Token mới
      );
    }
    //4. Xóa cookie ở trình duyệt
    res.clearCookie("refreshToken", {
      // cần các thuộc tính phải phù hợp với lúc tạo mới tìm đc như path,...
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });
    //5. Trả kết quả
    return res.status(200).json({
      // vẫn trả 200 nếu cookie ko tồn tại or token bị thu hồi => Nhấn Logout nhiều lần sẽ ko gây lỗi
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
}; // ko xóa Document khỏi MongoDB mà đánh dấu token đã bị thu hồi

module.exports = { register, login, refreshAccessToken, logout };

//200 OK – Thành công
//201 Created – Tạo mới thành công
//400 Bad Request – Dữ liệu không hợp lệ
//401 Unauthorized – Chưa xác thực hợp lệ
//403 Forbidden – Không có quyền
//404 Not Found – Không tìm thấy
//409 Conflict – Xung đột dữ liệu
//500 Internal Server Error – Lỗi server
