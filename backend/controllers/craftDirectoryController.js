
const mongoose = require("mongoose");
const CraftDirectory = require("../models/CraftDirectory");
const Craft = require("../models/Craft");

// ==================================================
// HÀM HỖ TRỢ
// ==================================================

// Kiểm tra ID MongoDB
const isValidId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Xử lý lỗi dùng chung
const handleError = (res, error, message) => {
  console.error(message, error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Đường dẫn của nhóm nghề đã tồn tại",
    });
  }

  if (
      error.name === "ValidationError" ||
      error.name === "CastError"
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message,
  });
};

// ==================================================
// 1. PUBLIC: LẤY DANH SÁCH DANH MỤC ĐANG HOẠT ĐỘNG
// ==================================================

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
    return handleError(
        res,
        error,
        "Lỗi máy chủ khi lấy danh sách danh mục"
    );
  }
};

// ==================================================
// 2. ADMIN: LẤY TẤT CẢ DANH MỤC
// ==================================================

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
    return handleError(
        res,
        error,
        "Lỗi máy chủ khi lấy danh sách danh mục"
    );
  }
};

// ==================================================
// 3. ADMIN: THÊM DANH MỤC
// ==================================================

const createCraftDirectory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      imageUrl,
      parentId,
      sortOrder,
    } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof slug !== "string" ||
        !slug.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Tên và đường dẫn nhóm nghề không được để trống",
      });
    }

    // Nếu thêm nhóm nghề trực thuộc
    if (parentId) {

      if (!isValidId(parentId)) {
        return res.status(400).json({
          success: false,
          message: "ID nhóm nghề cấp trên không hợp lệ",
        });
      }

      const parent = await CraftDirectory.findById(parentId);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Nhóm nghề cấp trên không tồn tại",
        });
      }

      // Không thêm vào nhóm đã ẩn
      if (!parent.isActive) {
        return res.status(400).json({
          success: false,
          message: "Nhóm nghề cấp trên đang bị ẩn",
        });
      }

      // Chỉ cho phép tối đa hai cấp
      if (parent.parentId) {
        return res.status(400).json({
          success: false,
          message:
              "Không thể tạo thêm nhóm trực thuộc. " +
              "Hệ thống chỉ hỗ trợ tối đa hai cấp nhóm nghề.",
        });
      }
    }

    const newDirectory = await CraftDirectory.create({
      name: name.trim(),
      slug: slug.trim(),
      description,
      imageUrl,
      parentId: parentId || null,
      sortOrder: sortOrder ?? 0,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm nhóm nghề thành công",
      data: newDirectory,
    });

  } catch (error) {
    return handleError(
        res,
        error,
        "Lỗi máy chủ khi thêm nhóm nghề"
    );
  }
};

// ==================================================
// 4. ADMIN: CẬP NHẬT DANH MỤC
// ==================================================

const updateCraftDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nhóm nghề không hợp lệ",
      });
    }

    const directory = await CraftDirectory.findById(id);

    if (!directory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm nghề",
      });
    }

    const {
      name,
      slug,
      description,
      imageUrl,
      parentId,
      sortOrder,
      isActive,
    } = req.body;

    // Kiểm tra trạng thái gửi lên
    if (
        isActive !== undefined &&
        typeof isActive !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái hiển thị không hợp lệ",
      });
    }

    // Xác định nhóm cấp trên sau khi cập nhật
    const nextParentId =
        parentId !== undefined
            ? parentId || null
            : directory.parentId;

    // Xác định trạng thái sau khi cập nhật
    const nextIsActive =
        isActive !== undefined
            ? isActive
            : directory.isActive;

    const parentChanged =
        String(nextParentId || "") !==
        String(directory.parentId || "");

    // ==========================================
    // KIỂM TRA NHÓM NGHỀ CẤP TRÊN
    // ==========================================

    if (nextParentId) {

      if (!isValidId(nextParentId)) {
        return res.status(400).json({
          success: false,
          message: "ID nhóm nghề cấp trên không hợp lệ",
        });
      }

      // Không được chọn chính mình
      if (directory._id.equals(nextParentId)) {
        return res.status(400).json({
          success: false,
          message:
              "Không thể chọn chính nhóm nghề này làm nhóm cấp trên",
        });
      }

      const parent = await CraftDirectory.findById(
          nextParentId
      );

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Nhóm nghề cấp trên không tồn tại",
        });
      }

      // Không cho chuyển vào nhóm đã ẩn
      // hoặc khôi phục khi nhóm cấp trên đang ẩn
      if (
          !parent.isActive &&
          (parentChanged || nextIsActive)
      ) {
        return res.status(400).json({
          success: false,
          message:
              "Nhóm nghề cấp trên đang bị ẩn. " +
              "Vui lòng khôi phục nhóm cấp trên trước.",
        });
      }

      // Không cho tạo cấp thứ ba
      if (parent.parentId) {
        return res.status(400).json({
          success: false,
          message:
              "Hệ thống chỉ hỗ trợ tối đa hai cấp nhóm nghề",
        });
      }

      // Nhóm đang chứa các nhóm trực thuộc
      // không thể chuyển thành nhóm cấp dưới
      const childCount =
          await CraftDirectory.countDocuments({
            parentId: id,
          });

      if (childCount > 0) {
        return res.status(409).json({
          success: false,
          message:
              "Nhóm nghề này đang chứa các nhóm trực thuộc. " +
              "Không thể chuyển thành nhóm cấp dưới.",
          data: {
            childCount,
          },
        });
      }
    }

    // ==========================================
    // KIỂM TRA KHI ẨN NHÓM NGHỀ
    // ==========================================

    if (!nextIsActive) {

      const activeChildCount =
          await CraftDirectory.countDocuments({
            parentId: id,
            isActive: true,
          });

      if (activeChildCount > 0) {
        return res.status(409).json({
          success: false,
          message:
              `Không thể ẩn nhóm nghề vì còn ` +
              `${activeChildCount} nhóm trực thuộc đang hoạt động. ` +
              "Vui lòng ẩn các nhóm trực thuộc trước.",
          data: {
            activeChildCount,
          },
        });
      }
    }

    // ==========================================
    // CẬP NHẬT DỮ LIỆU
    // ==========================================

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Tên nhóm nghề không được để trống",
        });
      }

      directory.name = name.trim();
    }

    if (slug !== undefined) {
      if (typeof slug !== "string" || !slug.trim()) {
        return res.status(400).json({
          success: false,
          message: "Đường dẫn nhóm nghề không được để trống",
        });
      }

      directory.slug = slug.trim();
    }

    if (description !== undefined) {
      directory.description = description;
    }

    if (imageUrl !== undefined) {
      directory.imageUrl = imageUrl;
    }

    if (parentId !== undefined) {
      directory.parentId = nextParentId;
    }

    if (sortOrder !== undefined) {
      directory.sortOrder = sortOrder;
    }

    if (isActive !== undefined) {
      directory.isActive = isActive;
    }

    await directory.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật nhóm nghề thành công",
      data: directory,
    });

  } catch (error) {
    return handleError(
        res,
        error,
        "Lỗi máy chủ khi cập nhật nhóm nghề"
    );
  }
};

// ==================================================
// 5. ADMIN: ẨN DANH MỤC
// ==================================================

const deleteCraftDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nhóm nghề không hợp lệ",
      });
    }

    const directory = await CraftDirectory.findById(id);

    if (!directory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm nghề",
      });
    }

    // Kiểm tra nhóm trực thuộc đang hoạt động
    const activeChildCount =
        await CraftDirectory.countDocuments({
          parentId: id,
          isActive: true,
        });

    if (activeChildCount > 0) {
      return res.status(409).json({
        success: false,
        message:
            `Không thể ẩn nhóm nghề "${directory.name}" ` +
            `vì còn ${activeChildCount} nhóm trực thuộc đang hoạt động. ` +
            "Vui lòng ẩn các nhóm trực thuộc trước.",
        data: {
          activeChildCount,
        },
      });
    }

    // Chỉ ẩn, không xóa dữ liệu
    directory.isActive = false;

    await directory.save();

    return res.status(200).json({
      success: true,
      message: "Ẩn nhóm nghề thành công",
      data: directory,
    });

  } catch (error) {
    return handleError(
        res,
        error,
        "Lỗi máy chủ khi ẩn nhóm nghề"
    );
  }
};

// ==================================================
// 6. ADMIN: XÓA VĨNH VIỄN DANH MỤC
// ==================================================

const permanentlyDeleteCraftDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "ID nhóm nghề không hợp lệ",
      });
    }

    const directory = await CraftDirectory.findById(id);

    if (!directory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhóm nghề",
      });
    }

    // Kiểm tra tất cả dữ liệu liên quan
    const [craftCount, childCount] = await Promise.all([
      Craft.countDocuments({
        directoryId: id,
      }),

      CraftDirectory.countDocuments({
        parentId: id,
      }),
    ]);

    // Chặn xóa nếu còn dữ liệu liên kết
    if (craftCount > 0 || childCount > 0) {
      return res.status(409).json({
        success: false,
        message:
            `Không thể xóa nhóm nghề "${directory.name}" ` +
            `vì còn ${craftCount} nghề thủ công và ` +
            `${childCount} nhóm nghề trực thuộc. ` +
            "Vui lòng chuyển dữ liệu sang nhóm khác trước khi xóa.",
        data: {
          craftCount,
          childCount,
        },
      });
    }

    // Xóa vĩnh viễn
    const deletedDirectory =
        await CraftDirectory.findByIdAndDelete(id);

    if (!deletedDirectory) {
      return res.status(404).json({
        success: false,
        message: "Nhóm nghề không còn tồn tại",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa nhóm nghề vĩnh viễn thành công",
    });

  } catch (error) {
    return handleError(
        res,
        error,
        "Lỗi máy chủ khi xóa nhóm nghề"
    );
  }
};

// ==================================================
// EXPORT TẤT CẢ CHỨC NĂNG
// ==================================================

module.exports = {
  getPublicCraftDirectories,
  getAdminCraftDirectories,
  createCraftDirectory,
  updateCraftDirectory,
  deleteCraftDirectory,
  permanentlyDeleteCraftDirectory,
};
