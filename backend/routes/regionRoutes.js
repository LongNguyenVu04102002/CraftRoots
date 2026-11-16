
const express = require("express");
const router = express.Router();

const regionController = require("../controllers/regionController");

// ======================================
// PUBLIC ROUTES
// ======================================

// Lấy danh sách Region đã công khai
router.get("/public/regions", regionController.getPublicRegions);


// ======================================
// ADMIN ROUTES
// ======================================

// Lấy tất cả Region (có tìm kiếm, lọc)
router.get("/admin/regions", regionController.getAllRegions);

// Lấy chi tiết Region theo ID
router.get("/admin/regions/:id", regionController.getRegionById);

// Thêm Region
router.post("/admin/regions", regionController.createRegion);

// Cập nhật Region
router.put("/admin/regions/:id", regionController.updateRegion);

// Ẩn / hiện Region
router.patch("/admin/regions/:id/status", regionController.changeRegionStatus);

// Xóa mềm Region
router.delete("/admin/regions/:id", regionController.deleteRegion);


module.exports = router;
