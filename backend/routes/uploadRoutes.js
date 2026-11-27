const express = require("express");
const router = express.Router();

const { authenticate, authorize } = require("../middlewares/authMiddleware");
const uploadVillageImageMiddleware = require("../middlewares/uploadMiddleware");
const { uploadVillageImage } = require("../controllers/uploadController");

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  uploadVillageImageMiddleware,
  uploadVillageImage,
);

module.exports = router;
