
const mongoose = require("mongoose");

// Schema lưu hình ảnh và video
const mediaSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true
        },

        caption: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        _id: false
    }
);

// Schema lưu nguồn tư liệu
const sourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: ""
        },

        url: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        _id: false
    }
);

const villageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 160
        },

        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            maxlength: 200
        },

        regionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Region",
            required: true,
            index: true
        },

        province: {
            type: String,
            trim: true,
            default: "",
            maxlength: 120
        },

        commune: {
            type: String,
            trim: true,
            default: "",
            maxlength: 120
        },

        address: {
            type: String,
            trim: true,
            default: "",
            maxlength: 500
        },

        history: {
            type: String,
            trim: true,
            default: ""
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        mainImage: {
            type: String,
            trim: true,
            default: ""
        },

        images: {
            type: [mediaSchema],
            default: []
        },

        videos: {
            type: [mediaSchema],
            default: []
        },

        location: {
            latitude: {
                type: Number,
                min: -90,
                max: 90
            },

            longitude: {
                type: Number,
                min: -180,
                max: 180
            }
        },

        craftIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Craft"
            }
        ],

        sourceReferences: {
            type: [sourceSchema],
            default: []
        },

        isPublished: {
            type: Boolean,
            required: true,
            default: false,
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

// Index phục vụ tìm kiếm
villageSchema.index({
    name: "text",
    description: "text",
    history: "text"
});

// Index phục vụ lọc làng nghề theo vùng và trạng thái
villageSchema.index({
    regionId: 1,
    isPublished: 1,
    isDeleted: 1
});

module.exports = mongoose.model("Village", villageSchema);
