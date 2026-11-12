
const mongoose = require("mongoose");

const craftSchema = new mongoose.Schema(
    {
        // Tên nghề thủ công
        name: {
            type: String,
            required: [true, "Tên nghề thủ công không được để trống"],
            trim: true,
            maxlength: 150
        },

        // Đường dẫn của nghề
        slug: {
            type: String,
            required: [true, "Slug không được để trống"],
            unique: true,
            trim: true,
            lowercase: true
        },

        // Danh mục nghề
        directoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CraftDirectory",
            required: [true, "Vui lòng chọn danh mục nghề"]
        },

        // Những làng nghề gắn với nghề này
        villageIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Village"
        }],

        // Mô tả nghề
        description: {
            type: String,
            default: "",
            trim: true
        },

        // Lịch sử hình thành và phát triển
        history: {
            type: String,
            default: ""
        },

        // Nguyên liệu sử dụng
        materials: [{
            type: String,
            trim: true
        }],

        // Công cụ sử dụng
        tools: [{
            type: String,
            trim: true
        }],

        // Các bước thực hiện nghề
        processSteps: [{
            title: {
                type: String,
                trim: true
            },
            description: {
                type: String,
                trim: true
            },
            imageUrl: {
                type: String,
                default: ""
            },
            order: {
                type: Number,
                default: 0
            }
        }],

        // Hình ảnh nghề thủ công
        images: [{
            type: String
        }],

        // Nguồn tham khảo
        sourceReferences: [{
            type: String,
            trim: true
        }],

        // Trạng thái công khai
        isPublished: {
            type: Boolean,
            default: false
        },

        // Xóa mềm
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        collection: "crafts"
    }
);

const Craft =
    mongoose.models.Craft ||
    mongoose.model("Craft", craftSchema);

module.exports = Craft;
