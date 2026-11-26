const mongoose = require("mongoose");
const CraftDirectory = require("../models/CraftDirectory");

// 1. Lấy danh sách danh mục đang hoạt động (PUBLIC)
const getPublicCraftDirectories = async (req, res) => {
  try {
    const directories = await CraftDirectory.find({
      isActive: true,
    })
      .sort({ sortOrder: 1, name: 1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục thành công",
      data: directories,
    });
  } catch (error) {
    console.error("getPublicCraftDirectories error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách danh mục",
    });
  }
};

// 2. ADMIN: Lấy tất cả danh mục
const getAdminCraftDirectories = async (req, res) => {
  try {
    const directories = await CraftDirectory.find()
      .populate("parentId", "name")
      .sort({ sortOrder: 1, name: 1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách danh mục quản trị thành công",
      data: directories,
    });
  } catch (error) {
    console.error("getAdminCraftDirectories error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh mục",
    });
  }
};

// 3. ADMIN: Thêm danh mục
const createCraftDirectory = async (req, res) => {
  try {
    const { name, slug, description, imageUrl, parentId, sortOrder } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Tên và slug danh mục không được để trống",
      });
    }

    // Kiểm tra danh mục cha nếu có
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({
          success: false,
          message: "ID danh mục cha không hợp lệ",
        });
      }

      const parent = await CraftDirectory.findById(parentId);

      if (!parent || !parent.isActive) {
        return res.status(400).json({
          success: false,
          message: "Danh mục cha không tồn tại hoặc đã bị ẩn",
        });
      }
    }

    const newDirectory = await CraftDirectory.create({
      name,
      slug,
      description,
      imageUrl,
      parentId: parentId || null,
      sortOrder: sortOrder ?? 0,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm danh mục thành công",
      data: newDirectory,
    });
  } catch (error) {
    console.error("createCraftDirectory error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Slug danh mục đã tồn tại",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi thêm danh mục",
    });
  }
};

// 4. ADMIN: Cập nhật danh mục
const updateCraftDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID danh mục không hợp lệ",
      });
    }

    const directory = await CraftDirectory.findById(id);

    if (!directory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    const { name, slug, description, imageUrl, parentId, sortOrder, isActive } =
      req.body;

    if (parentId !== undefined && parentId !== null && parentId !== "") {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({
          success: false,
          message: "ID danh mục cha không hợp lệ",
        });
      }

      if (parentId === id) {
        return res.status(400).json({
          success: false,
          message: "Danh mục không thể là danh mục cha của chính nó",
        });
      }

      const parent = await CraftDirectory.findById(parentId);

      if (!parent || !parent.isActive) {
        return res.status(400).json({
          success: false,
          message: "Danh mục cha không tồn tại hoặc đã bị ẩn",
        });
      }
    }

    if (name !== undefined) directory.name = name;
    if (slug !== undefined) directory.slug = slug;
    if (description !== undefined) directory.description = description;
    if (imageUrl !== undefined) directory.imageUrl = imageUrl;
    if (parentId !== undefined) directory.parentId = parentId || null;
    if (sortOrder !== undefined) directory.sortOrder = sortOrder;
    if (isActive !== undefined) directory.isActive = isActive;

    await directory.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: directory,
    });
  } catch (error) {
    console.error("updateCraftDirectory error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Slug danh mục đã tồn tại",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi cập nhật danh mục",
    });
  }
};

// 5. ADMIN: Xóa mềm danh mục
const deleteCraftDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID danh mục không hợp lệ",
      });
    }

    const directory = await CraftDirectory.findById(id);

    if (!directory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    directory.isActive = false;
    await directory.save();

    return res.status(200).json({
      success: true,
      message: "Ẩn danh mục thành công",
      data: directory,
    });
  } catch (error) {
    console.error("deleteCraftDirectory error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi ẩn danh mục",
    });
  }
};

// Export tất cả chức năng
module.exports = {
  getPublicCraftDirectories,
  getAdminCraftDirectories,
  createCraftDirectory,
  updateCraftDirectory,
  deleteCraftDirectory,
};
