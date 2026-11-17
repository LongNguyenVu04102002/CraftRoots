
const mongoose = require("mongoose");

const craftSchema = new mongoose.Schema(
    {
        // 1. Tên nghề thủ công
        name: {
            type: String,
            required: [true, "Tên nghề thủ công không được để trống"],
            trim: true,
            maxlength: [150, "Tên nghề không được vượt quá 150 ký tự"]
        },

        // 2. Đường dẫn thân thiện của nghề
        slug: {
            type: String,
            required: [true, "Slug không được để trống"],
            unique: true,
            trim: true,
            lowercase: true
        },

        // 3. Danh mục nghề thủ công
        directoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CraftDirectory",
            required: [true, "Vui lòng chọn danh mục nghề"]
        },

        // 4. Danh sách làng nghề liên quan
        villageIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Village"
            }
        ],

        // 5. Mô tả nghề thủ công
        description: {
            type: String,
            default: "",
            trim: true
        },

        // 6. Lịch sử hình thành và phát triển
        history: {
            type: String,
            default: "",
            trim: true
        },

        // 7. Danh sách nguyên liệu
        materials: [
            {
                type: String,
                trim: true
            }
        ],

        // 8. Danh sách công cụ sử dụng
        tools: [
            {
                type: String,
                trim: true
            }
        ],

        // 9. Các bước thực hiện nghề thủ công
        processSteps: [
            {
                title: {
                    type: String,
                    required: true,
                    trim: true
                },

                description: {
                    type: String,
                    default: "",
                    trim: true
                },

                imageUrl: {
                    type: String,
                    default: ""
                },

                order: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            }
        ],

        // 10. Danh sách hình ảnh nghề thủ công
        images: [
            {
                type: String,
                trim: true
            }
        ],

        // 11. Nguồn tài liệu tham khảo
        sourceReferences: [
            {
                type: String,
                trim: true
            }
        ],

        // 12. Trạng thái hiển thị công khai
        isPublished: {
            type: Boolean,
            default: false
        },

        // 13. Trạng thái xóa mềm
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

// Tạo Model Craft
const Craft =
    mongoose.models.Craft ||
    mongoose.model("Craft", craftSchema);

module.exports = Craft;
