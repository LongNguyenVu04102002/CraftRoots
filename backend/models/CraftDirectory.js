
const mongoose = require("mongoose");

const craftDirectorySchema = new mongoose.Schema(
    {
        // Tên danh mục nghề
        name: {
            type: String,
            required: [true, "Tên danh mục không được để trống"],
            trim: true,
            maxlength: [100, "Tên danh mục không được vượt quá 100 ký tự"]
        },

        // Đường dẫn thân thiện, ví dụ: nghe-gom
        slug: {
            type: String,
            required: [true, "Slug không được để trống"],
            unique: true,
            trim: true,
            lowercase: true
        },

        // Mô tả danh mục
        description: {
            type: String,
            default: "",
            trim: true
        },

        // Đường dẫn ảnh đại diện
        imageUrl: {
            type: String,
            default: ""
        },

        // Danh mục cha, nếu là danh mục cấp cao nhất thì null
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CraftDirectory",
            default: null
        },

        // Thứ tự hiển thị
        sortOrder: {
            type: Number,
            default: 0,
            min: 0
        },

        // Trạng thái hoạt động
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        collection: "craftDirectories"
    }
);

// Tạo Model, tránh lỗi đăng ký Model trùng khi chạy lại
const CraftDirectory =
    mongoose.models.CraftDirectory ||
    mongoose.model("CraftDirectory", craftDirectorySchema);

module.exports = CraftDirectory;
