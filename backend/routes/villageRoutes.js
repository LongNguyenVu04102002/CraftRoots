
const express = require("express");
const router = express.Router();

const villageController = require("../controllers/villageController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");

// ======================================
// PUBLIC ROUTES
// ======================================

// Lấy danh sách Village đã công khai
router.get("/public/villages", villageController.getPublicVillages);
router.get("/villages", villageController.getPublicVillages);
router.get("/villages/:slug", villageController.getPublicVillageBySlug);


// ======================================
// ADMIN ROUTES
// ======================================
router.use("/admin", protect, authorizeRoles("ADMIN"));

// Lấy tất cả Village (tìm kiếm, lọc)
router.get("/admin/villages", villageController.getAllVillages);

// Lấy chi tiết Village theo ID
router.get("/admin/villages/:id", villageController.getVillageById);

// Thêm Village
router.post("/admin/villages", villageController.createVillage);

// Cập nhật Village
router.put("/admin/villages/:id", villageController.updateVillage);

// Ẩn / hiện Village
router.patch("/admin/villages/:id/status", villageController.changeVillageStatus);

// Xóa mềm Village
router.delete("/admin/villages/:id", villageController.deleteVillage);

module.exports = router;
