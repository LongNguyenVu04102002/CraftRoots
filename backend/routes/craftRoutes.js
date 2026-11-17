
const express = require("express");
const router = express.Router();

const {
    getPublicCrafts,
    getCraftDetail,
    getAdminCrafts,
    createCraft,
    updateCraft,
    deleteCraft
} = require("../controllers/craftController");

const {
    authenticate,
    authorize
} = require("../middlewares/authMiddleware");

// USER: Lấy danh sách nghề thủ công công khai
router.get("/", getPublicCrafts);

// USER: Xem chi tiết nghề thủ công
router.get("/:id", getCraftDetail);

// ADMIN: Lấy toàn bộ danh sách nghề
router.get(
    "/admin",
    authenticate,
    authorize("ADMIN"),
    getAdminCrafts
);

// ADMIN: Thêm nghề thủ công
router.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createCraft
);

// ADMIN: Cập nhật nghề thủ công
router.put(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    updateCraft
);

// ADMIN: Xóa mềm nghề thủ công
router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    deleteCraft
);

module.exports = router;
