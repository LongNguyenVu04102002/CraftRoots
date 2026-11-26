const mongoose = require("mongoose");

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

        description: {
            type: String,
            required: true,
            trim: true
        },

        history: {
            type: String,
            trim: true,
            default: ""
        },

        mainImage: {
            type: String,
            trim: true,
            default: ""
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
    }
);

villageSchema.index({
    name: "text",
    description: "text",
    history: "text"
});

villageSchema.index({
    regionId: 1,
    isPublished: 1,
    isDeleted: 1
});

module.exports = mongoose.model("Village", villageSchema);
