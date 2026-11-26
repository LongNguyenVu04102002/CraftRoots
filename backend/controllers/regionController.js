const mongoose = require("mongoose");
const Region = require("../models/Region");
const Village = require("../models/Village");

// Chuyển tên tiếng Việt thành slug
const slugify = (text) => {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

// 1. Lấy danh sách Region công khai
const getPublicRegions = async (req, res) => {
    try {
        const regions = await Region.find({
            isPublished: true,
            isDeleted: false
        }).sort({ name: 1 });

        return res.status(200).json({
            message: "Get regions successfully",
            data: regions
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// 2. Lấy danh sách Region dành cho Admin
const getAllRegions = async (req, res) => {
    try {
        const { search, isPublished, includeDeleted } = req.query;

        // Điều kiện tìm kiếm
        let filter = {};

        // Mặc định không lấy dữ liệu đã xóa mềm
        if (includeDeleted !== "true") {
            filter.isDeleted = false;
        }

        // Lọc theo trạng thái công khai
        if (isPublished === "true") {
            filter.isPublished = true;
        } else if (isPublished === "false") {
            filter.isPublished = false;
        }

        // Tìm kiếm theo tên hoặc mô tả
        if (search) {
            filter.$text = { $search: search };
        }

        const regions = await Region.find(filter)
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Get all regions successfully",
            data: regions
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// 3. Lấy chi tiết Region theo ID dành cho Admin
const getRegionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid region ID"
            });
        }

        const region = await Region.findOne({
            _id: id,
            isDeleted: false
        });

        if (!region) {
            return res.status(404).json({
                message: "Region not found"
            });
        }

        return res.status(200).json({
            message: "Get region successfully",
            data: region
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// 4. Thêm Region
const createRegion = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Kiểm tra tên Region
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Region name is required"
            });
        }

        // Nếu người dùng không nhập slug thì tự tạo từ name
        const slug = slugify(req.body.slug || name);

        if (!slug) {
            return res.status(400).json({
                message: "Invalid region slug"
            });
        }

        // Kiểm tra slug đã tồn tại chưa
        const existingRegion = await Region.findOne({ slug });

        if (existingRegion) {
            return res.status(409).json({
                message: "Region slug already exists"
            });
        }

        // Tạo Region mới
        const region = await Region.create({
            name,
            slug,
            description
        });

        return res.status(201).json({
            message: "Create region successfully",
            data: region
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Region slug already exists"
            });
        }

        return res.status(500).json({
            message: error.message
        });
    }
};

// 5. Cập nhật Region
const updateRegion = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isPublished } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid region ID"
            });
        }

        // Tìm Region cần cập nhật
        const region = await Region.findOne({
            _id: id,
            isDeleted: false
        });

        if (!region) {
            return res.status(404).json({
                message: "Region not found"
            });
        }

        // Cập nhật tên và tạo lại slug nếu có thay đổi tên
        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Region name cannot be empty"
                });
            }

            region.name = name;

            // Chỉ tự tạo slug mới nếu người dùng không gửi slug riêng
            if (req.body.slug === undefined) {
                region.slug = slugify(name);
            }
        }

        // Nếu người dùng nhập slug mới
        if (req.body.slug !== undefined) {
            const newSlug = slugify(req.body.slug);

            if (!newSlug) {
                return res.status(400).json({
                    message: "Region slug cannot be empty"
                });
            }

            region.slug = newSlug;
        }

        // Cập nhật các trường còn lại nếu được gửi lên
        if (description !== undefined) {
            region.description = description;
        }

        if (isPublished !== undefined) {
            if (typeof isPublished !== "boolean") {
                return res.status(400).json({
                    message: "isPublished must be true or false"
                });
            }

            region.isPublished = isPublished;
        }

        // Lưu thay đổi
        await region.save();

        return res.status(200).json({
            message: "Update region successfully",
            data: region
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Region slug already exists"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: error.message
        });
    }
};

// 6. Ẩn / hiện Region
const changeRegionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublished } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid region ID"
            });
        }

        if (typeof isPublished !== "boolean") {
            return res.status(400).json({
                message: "isPublished must be true or false"
            });
        }

        const region = await Region.findOne({
            _id: id,
            isDeleted: false
        });

        if (!region) {
            return res.status(404).json({
                message: "Region not found"
            });
        }

        region.isPublished = isPublished;
        await region.save();

        return res.status(200).json({
            message: isPublished
                ? "Publish region successfully"
                : "Hide region successfully",
            data: region
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// 7. Xóa mềm Region
const deleteRegion = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid region ID"
            });
        }

        // Tìm Region cần xóa
        const region = await Region.findOne({
            _id: id,
            isDeleted: false
        });

        if (!region) {
            return res.status(404).json({
                message: "Region not found"
            });
        }

        // Kiểm tra có Village nào đang sử dụng Region này không
        const villageCount = await Village.countDocuments({
            regionId: id,
            isDeleted: false
        });

        if (villageCount > 0) {
            return res.status(400).json({
                message: "Cannot delete region because it is being used by villages"
            });
        }

        // Xóa mềm: chỉ cập nhật isDeleted
        region.isDeleted = true;
        await region.save();

        return res.status(200).json({
            message: "Delete region successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getPublicRegions,
    getAllRegions,
    getRegionById,
    createRegion,
    updateRegion,
    changeRegionStatus,
    deleteRegion
};
