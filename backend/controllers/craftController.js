const mongoose = require("mongoose");

const Craft = require("../models/Craft");
const CraftDirectory = require("../models/CraftDirectory");
const Village = require("../models/Village");

// ==========================================
// HÀM HỖ TRỢ
// ==========================================

// Kiểm tra danh sách ID làng nghề
const validateVillageIds = async (villageIds) => {
  if (!Array.isArray(villageIds)) {
    return {
      valid: false,
      message: "Danh sách làng nghề phải là một mảng",
    };
  }

  // Loại bỏ ID trùng nhau
  const uniqueIds = [...new Set(villageIds.map(String))];

  // Kiểm tra định dạng ObjectId
  for (const id of uniqueIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        valid: false,
        message: `ID làng nghề không hợp lệ: ${id}`,
      };
    }
  }

  // Kiểm tra làng nghề có tồn tại và chưa bị xóa
  const villages = await Village.find({
    _id: { $in: uniqueIds },
    isDeleted: false,
  });

  if (villages.length !== uniqueIds.length) {
    return {
      valid: false,
      message: "Có làng nghề không tồn tại hoặc đã bị xóa",
    };
  }

  return {
    valid: true,
    villageIds: uniqueIds,
  };
};

// Kiểm tra danh mục nghề
const validateDirectory = async (directoryId) => {
  if (!mongoose.Types.ObjectId.isValid(directoryId)) {
    return {
      valid: false,
      message: "ID danh mục không hợp lệ",
    };
  }

  const directory = await CraftDirectory.findOne({
    _id: directoryId,
    isActive: true,
  });

  if (!directory) {
    return {
      valid: false,
      message: "Danh mục không tồn tại hoặc đang bị khóa",
    };
  }

  return { valid: true };
};

// Đồng bộ quan hệ Craft và Village
const syncVillageCrafts = async (craftId, oldVillageIds, newVillageIds) => {
  const oldIds = oldVillageIds.map(String);
  const newIds = newVillageIds.map(String);

  // Những làng không còn liên kết với nghề
  const removedIds = oldIds.filter((id) => !newIds.includes(id));

  // Những làng mới được liên kết với nghề
  const addedIds = newIds.filter((id) => !oldIds.includes(id));

  if (removedIds.length > 0) {
    await Village.updateMany(
      { _id: { $in: removedIds } },
      { $pull: { craftIds: craftId } },
    );
  }

  if (addedIds.length > 0) {
    await Village.updateMany(
      { _id: { $in: addedIds } },
      { $addToSet: { craftIds: craftId } },
    );
  }
};

// ==========================================
// 1. LẤY DANH SÁCH NGHỀ CÔNG KHAI
// ==========================================

const getPublicCrafts = async (req, res) => {
  try {
    const crafts = await Craft.find({
      isPublished: true,
      isDeleted: false,
    })
      .populate("directoryId", "name slug")
      .populate("villageIds", "name slug province commune mainImage")
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nghề thủ công thành công",
      data: crafts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nghề thủ công",
      error: error.message,
    });
  }
};

// ==========================================
// 2. XEM CHI TIẾT NGHỀ THỦ CÔNG
// ==========================================

const getCraftDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nghề thủ công không hợp lệ",
      });
    }

    const craft = await Craft.findOne({
      _id: id,
      isPublished: true,
      isDeleted: false,
    })
      .populate("directoryId", "name slug")
      .populate("villageIds", "name slug province commune address mainImage")
      .select("-__v");

    if (!craft) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nghề thủ công",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết nghề thủ công thành công",
      data: craft,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết nghề thủ công",
      error: error.message,
    });
  }
};

// ==========================================
// 3. ADMIN LẤY TẤT CẢ NGHỀ THỦ CÔNG
// ==========================================

const getAdminCrafts = async (req, res) => {
  try {
    const crafts = await Craft.find({
      isDeleted: false,
    })
      .populate("directoryId", "name slug")
      .populate("villageIds", "name slug")
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nghề thủ công thành công",
      data: crafts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nghề thủ công",
      error: error.message,
    });
  }
};

// ==========================================
// 4. ADMIN THÊM NGHỀ THỦ CÔNG
// ==========================================

const createCraft = async (req, res) => {
  try {
    const {
      name,
      slug,
      directoryId,
      villageIds,
      description,
      history,
      materials,
      tools,
      processSteps,
      images,
      sourceReferences,
      isPublished,
    } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!name || !slug || !directoryId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên nghề, slug và danh mục",
      });
    }

    // Kiểm tra danh mục
    const directoryCheck = await validateDirectory(directoryId);

    if (!directoryCheck.valid) {
      return res.status(400).json({
        success: false,
        message: directoryCheck.message,
      });
    }

    // Kiểm tra danh sách làng nghề
    const villageCheck = await validateVillageIds(villageIds || []);

    if (!villageCheck.valid) {
      return res.status(400).json({
        success: false,
        message: villageCheck.message,
      });
    }

    // Tạo nghề thủ công mới
    const craft = await Craft.create({
      name,
      slug,
      directoryId,
      villageIds: villageCheck.villageIds,
      description,
      history,
      materials,
      tools,
      processSteps,
      images,
      sourceReferences,
      isPublished: isPublished === true,
    });

    // Cập nhật quan hệ ở phía Village
    await syncVillageCrafts(craft._id, [], villageCheck.villageIds);

    return res.status(201).json({
      success: true,
      message: "Thêm nghề thủ công thành công",
      data: craft,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug nghề thủ công đã tồn tại",
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
      message: "Lỗi khi thêm nghề thủ công",
      error: error.message,
    });
  }
};

// ==========================================
// 5. ADMIN CẬP NHẬT NGHỀ THỦ CÔNG
// ==========================================

const updateCraft = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nghề thủ công không hợp lệ",
      });
    }

    const craft = await Craft.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!craft) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nghề thủ công",
      });
    }

    const {
      name,
      slug,
      directoryId,
      villageIds,
      description,
      history,
      materials,
      tools,
      processSteps,
      images,
      sourceReferences,
      isPublished,
    } = req.body;

    // Kiểm tra danh mục nếu có thay đổi
    if (directoryId !== undefined) {
      const directoryCheck = await validateDirectory(directoryId);

      if (!directoryCheck.valid) {
        return res.status(400).json({
          success: false,
          message: directoryCheck.message,
        });
      }

      craft.directoryId = directoryId;
    }

    // Lưu danh sách làng cũ
    const oldVillageIds = craft.villageIds.map(String);

    // Kiểm tra và cập nhật làng nghề nếu có gửi lên
    if (villageIds !== undefined) {
      const villageCheck = await validateVillageIds(villageIds);

      if (!villageCheck.valid) {
        return res.status(400).json({
          success: false,
          message: villageCheck.message,
        });
      }

      craft.villageIds = villageCheck.villageIds;
    }

    // Cập nhật các trường thông tin
    if (name !== undefined) craft.name = name;
    if (slug !== undefined) craft.slug = slug;
    if (description !== undefined) craft.description = description;
    if (history !== undefined) craft.history = history;
    if (materials !== undefined) craft.materials = materials;
    if (tools !== undefined) craft.tools = tools;
    if (processSteps !== undefined) craft.processSteps = processSteps;
    if (images !== undefined) craft.images = images;
    if (sourceReferences !== undefined) {
      craft.sourceReferences = sourceReferences;
    }
    if (isPublished !== undefined) {
      craft.isPublished = isPublished;
    }

    // Lưu thay đổi
    await craft.save();

    // Đồng bộ quan hệ Village nếu danh sách làng thay đổi
    if (villageIds !== undefined) {
      await syncVillageCrafts(craft._id, oldVillageIds, craft.villageIds);
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật nghề thủ công thành công",
      data: craft,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Slug nghề thủ công đã tồn tại",
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
      message: "Lỗi khi cập nhật nghề thủ công",
      error: error.message,
    });
  }
};

// ==========================================
// 6. ADMIN XÓA MỀM NGHỀ THỦ CÔNG
// ==========================================

const deleteCraft = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nghề thủ công không hợp lệ",
      });
    }

    const craft = await Craft.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!craft) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nghề thủ công",
      });
    }

    // Xóa mềm
    craft.isDeleted = true;
    await craft.save();

    // Gỡ liên kết nghề khỏi các làng nghề
    await Village.updateMany(
      { _id: { $in: craft.villageIds } },
      { $pull: { craftIds: craft._id } },
    );

    return res.status(200).json({
      success: true,
      message: "Xóa nghề thủ công thành công",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi xóa nghề thủ công",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT CÁC HÀM
// ==========================================

module.exports = {
  getPublicCrafts,
  getCraftDetail,
  getAdminCrafts,
  createCraft,
  updateCraft,
  deleteCraft,
};
