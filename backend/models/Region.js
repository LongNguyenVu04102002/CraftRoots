
const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },

        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            maxlength: 160
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        isPublished: {
            type: Boolean,
            required: true,
            default: true,
            index: true
        },

        isDeleted: {
            type: Boolean,
            required: true,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Index phục vụ tìm kiếm theo tên và mô tả
regionSchema.index({
    name: "text",
    description: "text"
});

module.exports = mongoose.model("Region", regionSchema);
