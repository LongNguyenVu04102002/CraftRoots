// MODEL USER
// Lưu tài khoản, email, mật khẩu đã mã hóa, vai trò USER/ARTISAN/ADMIN,
// trạng thái tài khoản và thông tin đăng ký trở thành nghệ nhân.

const mongoose = require("mongoose");

const artisanApplicationSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["NOT_REQUESTED", "PENDING", "APPROVED", "REJECTED"],
    default: "NOT_REQUESTED",
  },
  introduction: {
    type: String,
    default: "",
  },
  experienceYears: {
    type: Number,
    min: 0,
    default: 0,
  },
  //Array vì cung cấp nhiều ảnh sản phẩm từng làm, ảnh xưởng, vv...
  evidenceUrls: {
    type: [String],
    default: [],
  },
  //Ghi chú của ADMIN khi xét duyệt => Lý do duyệt hay từ chối
  reviewNote: {
    type: String,
    default: "",
  },
  //Thời gian gửi đơn đăng ký
  submittedAt: {
    type: Date,
    default: null,
  },
  //Thời gian ADMIN xét duyệt đơn
  //=> Giúp biết 1 đơn đăng ký mất bao lâu để đc duyệt
  // Cập nhật khi ADMIN nhấn Approve or Reject
  reviewedAt: {
    type: Date,
    default: null,
  },
  //Người đã xét duyệt
  reviewedBy: {
    //lưu ID tham chiếu đến document khác
    type: mongoose.Schema.Types.ObjectId,
    //tham chiếu đến Model User
    ref: "User",
    default: null,
  },
});

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true, // tự động xóa khoảng trắng 2 đầu
    },
    email: {
      type: String,
      required: true,
      unique: true, // email duy nhất
      trim: true,
      lowercase: true, // tự động chuyển thành chữ thường trước khi lưu db
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // regex check: huy@huy.vn là hợp lệ
    },
    passwordHash: {
      type: String,
      required: true,
      //Tác dụng: Mặc định không lấy trường passwordHash khi truy vấn document bằng Mongoose
      //Mục đích: Nếu vô tình viết res.json(user) sẽ trả password về cho frontend vô tình làm lộ pass
      //Cách lấy:  thêm .select("+passwordHash") sẽ lấy thêm field bị loại
      select: false,
    },
    phone: {
      type: String,
      //Tác dụng: Lưu trường trong trường hợp user ko điền phone or điền sau
      //Mục đích: Đảm bảo dữ liệu có giá trị mặc định thống nhất, nếu ko có sẽ là undefined
      //=> Giúp frontend dễ xử lý hơn
      default: "",
    },
    avatarUrl: {
      //db chỉ lưu đường dẫn tới ảnh, ảnh sẽ lưu tại folder public của server or Cloudinary
      type: String,
      default: "",
    },
    role: {
      type: String,
      //enumerate(V): Liệt kê
      //Chỉ cho phép các giá trị nằm trong Mảng
      enum: ["USER", "ARTISAN", "ADMIN"],
      //mặc định USER rất quan trọng về bảo mật
      //ko cho phép người dùng tự chọn role:"ADMIN" khi đăng ký
      default: "USER",
    },
    accountStatus: {
      type: String,
      //LOCKED: Tài khoản bị khóa VD: Do bảo mật, nhập sai nhiều, đăng nhập từ vị trí lạ
      //DISALBED: Tài khoản bị vô hiệu hóa VD: Do vi phạm chính sách, đăng nội dung cấm, gian lận
      enum: ["ACTIVE", "LOCKED", "DISABLED"],
      default: "ACTIVE",
    },
    artisanApplication: {
      // thông tin đăng ký thành artisan(nghệ nhân)
      //nhúng Schema vào Schema (Subdocument)
      type: artisanApplicationSchema,
      //cần có để khởi tạo các giá trị của artisanApplicationSchema
      default: () => ({}),
    },
    lastLoginAt: {
      // lần cuối đăng nhập
      // trong JS dùng new Date() lấy thời điểm hiện tại
      type: Date,
      default: null,
    },
  },
  {
    //Schema Options: Cấu hình cho toàn bộ Schema
    //Mongoose tự động tạo 2 field createdAt và updatedAt nên ko cần tự tạo
    timestamps: true,
    //collection sẽ lưu document
    collection: "users",
  },
);
//index phục vụ tìm kiếm và lọc
// Trong User Management có thể cần lọc tài khoản theo cả vai trò và trạng thái
//role đứng trước => index phù hợp có ĐK role <=> Ngược lại có thể đảo nếu truy vấn sử dụng accountStatus trước
userSchema.index({ role: 1, accountStatus: 1 });
//Admin cần tìm những người đang chờ xét duyệt trở thành nghệ nhân
userSchema.index({ "artisanApplication.status": 1 });

//Dùng METHOD của Mongoose => ko xuất passwordHash và __v(versionKey) khi chuyển document sang JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    // doc ở đây là document, ret(return value) là JSON trả về
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
