
const Village = require("../models/Village");
const Region = require("../models/Region");
const { stripProvincePrefix } = require("../data/vietnamLocations");

const escapeRegex = (text = "") =>
    text.toString().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const slugify = (text = "") =>
    text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/(^-|-$)/g, "");

const buildProvinceFilter = (province = "") => {
    const baseName = stripProvincePrefix(province);
    if (!baseName) return undefined;
    return new RegExp(`^(TP\\.\\s*|Thành phố\\s+|Tỉnh\\s+)?${escapeRegex(baseName)}$`, "i");
};

const buildSearchConditions = (search = "") => {
    const keyword = escapeRegex(search.trim());
    if (!keyword) return null;
    const regex = new RegExp(keyword, "i");
    return [
        { name: regex },
        { description: regex },
        { history: regex },
        { province: regex },
        { commune: regex }
    ];
};

// ======================================
// PUBLIC: LẤY DANH SÁCH VILLAGE
// ======================================

const getPublicVillages = async (req, res) => {
    try {
        const { search, regionId, province, commune, page = 1, limit = 10 } = req.query;

        const filter = {
            isPublished: true,
            isDeleted: false
        };

        if (regionId) {
            filter.regionId = regionId;
        }

        if (province) {
            filter.province = buildProvinceFilter(province);
        }

        if (commune) {
            filter.commune = new RegExp(`^${escapeRegex(commune.trim())}$`, "i");
        }

        const searchOr = buildSearchConditions(search);
        if (searchOr) {
            filter.$or = searchOr;
        }

        const villages = await Village.find(filter)
            .populate("regionId", "name slug")
            .populate("craftIds")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Village.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: villages,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getPublicVillageBySlug = async (req, res) => {
    try {
        const village = await Village.findOne({
            slug: req.params.slug,
            isPublished: true,
            isDeleted: false
        })
            .populate("regionId", "name slug")
            .populate("craftIds");

        if (!village) {
            return res.status(404).json({ success: false, message: "Village not found" });
        }

        return res.status(200).json({ success: true, data: village });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ======================================
// ADMIN: LẤY TẤT CẢ VILLAGE
// ======================================

const getAllVillages = async (req, res) => {
    try {
        const {
            search,
            regionId,
            province,
            commune,
            isPublished,
            page = 1,
            limit = 10
        } = req.query;

        const filter = {
            isDeleted: false
        };

        const searchOr = buildSearchConditions(search);
        if (searchOr) {
            filter.$or = searchOr;
        }

        if (regionId) {
            filter.regionId = regionId;
        }

        if (province) {
            filter.province = buildProvinceFilter(province);
        }

        if (commune) {
            filter.commune = new RegExp(`^${escapeRegex(commune.trim())}$`, "i");
        }

        if (isPublished !== undefined) {
            filter.isPublished = isPublished === "true";
        }

        const villages = await Village.find(filter)
            .populate("regionId", "name slug")
            .populate("craftIds")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Village.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: villages,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// ADMIN: LẤY CHI TIẾT VILLAGE
// ======================================

const getVillageById = async (req, res) => {
    try {
        const village = await Village.findOne({
            _id: req.params.id,
            isDeleted: false
        })
            .populate("regionId", "name slug")
            .populate("craftIds");

        if (!village) {
            return res.status(404).json({
                success: false,
                message: "Village not found"
            });
        }

        res.status(200).json({
            success: true,
            data: village
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// ADMIN: THÊM VILLAGE
// ======================================

const createVillage = async (req, res) => {
    try {
        const {
            name,
            slug,
            regionId,
            province,
            commune,
            address,
            history,
            description,
            mainImage,
            images,
            videos,
            location,
            craftIds,
            sourceReferences,
            isPublished
        } = req.body;

        // Kiểm tra Region tồn tại
        const region = await Region.findOne({
            _id: regionId,
            isDeleted: false
        });

        if (!region) {
            return res.status(404).json({
                success: false,
                message: "Region not found"
            });
        }

        // Kiểm tra tên làng nghề và tự tạo slug nếu để trống
        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Village name is required"
            });
        }

        const finalSlug = slugify(slug && slug.trim() ? slug : name);
        if (!finalSlug) {
            return res.status(400).json({
                success: false,
                message: "Invalid village slug"
            });
        }

        // Kiểm tra slug trùng
        const existingVillage = await Village.findOne({ slug: finalSlug });

        if (existingVillage) {
            return res.status(400).json({
                success: false,
                message: "Village slug already exists"
            });
        }

        const village = await Village.create({
            name,
            slug: finalSlug,
            regionId,
            province,
            commune,
            address,
            history,
            description,
            mainImage,
            images,
            videos,
            location,
            craftIds,
            sourceReferences,
            isPublished
        });

        res.status(201).json({
            success: true,
            message: "Create village successfully",
            data: village
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// ADMIN: CẬP NHẬT VILLAGE
// ======================================

const updateVillage = async (req, res) => {
    try {
        const village = await Village.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!village) {
            return res.status(404).json({
                success: false,
                message: "Village not found"
            });
        }

        const updateData = { ...req.body };

        // Không cho cập nhật các trường quản lý hệ thống
        delete updateData._id;
        delete updateData.isDeleted;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        // Kiểm tra Region nếu có thay đổi
        if (updateData.regionId) {
            const region = await Region.findOne({
                _id: updateData.regionId,
                isDeleted: false
            });

            if (!region) {
                return res.status(404).json({
                    success: false,
                    message: "Region not found"
                });
            }
        }

        // Chuẩn hóa / tự sinh slug nếu để trống và kiểm tra trùng
        if (updateData.slug !== undefined) {
            const rawSlug = updateData.slug.toString().trim();
            updateData.slug = slugify(rawSlug || updateData.name || village.name);
        } else if (updateData.name !== undefined) {
            updateData.slug = slugify(updateData.name);
        }

        if (updateData.slug !== undefined) {
            if (!updateData.slug) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid village slug"
                });
            }

            const existingVillage = await Village.findOne({
                slug: updateData.slug,
                _id: { $ne: req.params.id }
            });

            if (existingVillage) {
                return res.status(400).json({
                    success: false,
                    message: "Village slug already exists"
                });
            }
        }

        Object.assign(village, updateData);

        await village.save();

        res.status(200).json({
            success: true,
            message: "Update village successfully",
            data: village
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// ADMIN: ẨN / HIỆN VILLAGE
// ======================================

const changeVillageStatus = async (req, res) => {
    try {
        const { isPublished } = req.body;

        if (typeof isPublished !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isPublished must be true or false"
            });
        }

        const village = await Village.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false
            },
            {
                isPublished
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!village) {
            return res.status(404).json({
                success: false,
                message: "Village not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Change village status successfully",
            data: village
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// ADMIN: XÓA MỀM VILLAGE
// ======================================

const deleteVillage = async (req, res) => {
    try {
        const village = await Village.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false
            },
            {
                isDeleted: true,
                isPublished: false
            },
            {
                new: true
            }
        );

        if (!village) {
            return res.status(404).json({
                success: false,
                message: "Village not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Delete village successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================================
// EXPORT CONTROLLERS
// ======================================

module.exports = {
    getPublicVillages,
    getPublicVillageBySlug,
    getAllVillages,
    getVillageById,
    createVillage,
    updateVillage,
    changeVillageStatus,
    deleteVillage
};
