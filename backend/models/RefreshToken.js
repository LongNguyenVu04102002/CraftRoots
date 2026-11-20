//MODEL REFRESH TOKEN nó sẽ liên kết với bảng User
//User=>RefreshToken là quan hệ 1-N: Tức là 1 user tạo đc nhiều RefreshToken
//Mục đích: Tăng bảo mật,UX => Cấp lại Access Token mỗi khi hết hạn
const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    //Liên kết với User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //Tham chiếu tới model User + thêm sử dụng populate().
      required: true,
    },
    //Chỉ lưu hash của token
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    //Thời điểm Refresh Token hết hạn
    expiresAt: {
      type: Date,
      required: true,
    },
    //Thời điểm thu hồi token
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "refreshTokens",
  },
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
