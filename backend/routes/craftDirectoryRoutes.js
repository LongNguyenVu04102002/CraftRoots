
const express = require("express");

const {
  getPublicCraftDirectories,
  getAdminCraftDirectories,
  createCraftDirectory,
  updateCraftDirectory,
  deleteCraftDirectory,
  permanentlyDeleteCraftDirectory,
} = require("../controllers/craftDirectoryController");

const {
  authenticate,
  authorize,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// ==================================================
// 1. API CÔNG KHAI
// ==================================================

// Lấy danh sách danh mục đang hoạt động
router.get(
  "/",
  getPublicCraftDirectories
);

// ==================================================
// 2. API QUẢN TRỊ - CHỈ ADMIN
// ==================================================

// Lấy tất cả danh mục
router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  getAdminCraftDirectories
);

// Thêm danh mục
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createCraftDirectory
);

// Cập nhật danh mục
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateCraftDirectory
);

// Ẩn danh mục (xóa mềm)
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteCraftDirectory
);

// Xóa vĩnh viễn danh mục
router.delete(
  "/:id/permanent",
  authenticate,
  authorize("ADMIN"),
  permanentlyDeleteCraftDirectory
);

module.exports = router;
