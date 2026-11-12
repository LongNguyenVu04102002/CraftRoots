
const CraftDirectory = require("../models/CraftDirectory");

// Lấy danh sách danh mục nghề đang hoạt động
const getPublicCraftDirectories = async (req, res) => {
    try {
        const directories = await CraftDirectory.find({
            isActive: true
        })
            .sort({ sortOrder: 1, name: 1 })
            .select("-__v");

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách danh mục thành công",
            data: directories
        });

    } catch (error) {
        console.error("getPublicCraftDirectories error:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi lấy danh sách danh mục"
        });
    }
};

module.exports = {
    getPublicCraftDirectories
};
