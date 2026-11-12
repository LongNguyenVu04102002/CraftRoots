
const express = require("express");

const router = express.Router();

const {
    getPublicCraftDirectories
} = require("../controllers/craftDirectoryController");

// GET: Lấy danh sách danh mục nghề công khai
router.get("/", getPublicCraftDirectories);

module.exports = router;
