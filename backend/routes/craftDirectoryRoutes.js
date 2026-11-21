const express = require("express");
const router = express.Router();

const {
  getPublicCraftDirectories,
  getAdminCraftDirectories,
  createCraftDirectory,
  updateCraftDirectory,
  deleteCraftDirectory,
} = require("../controllers/craftDirectoryController");

const { authenticate, authorize } = require("../middlewares/authMiddleware");

console.log("authenticate:", typeof authenticate);
console.log("authorize:", typeof authorize);
console.log("getPublicCraftDirectories:", typeof getPublicCraftDirectories);
console.log("getAdminCraftDirectories:", typeof getAdminCraftDirectories);
console.log("createCraftDirectory:", typeof createCraftDirectory);
console.log("updateCraftDirectory:", typeof updateCraftDirectory);
console.log("deleteCraftDirectory:", typeof deleteCraftDirectory);

router.get("/", getPublicCraftDirectories);

router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  getAdminCraftDirectories,
);

router.post("/", authenticate, authorize("ADMIN"), createCraftDirectory);

router.put("/:id", authenticate, authorize("ADMIN"), updateCraftDirectory);

router.delete("/:id", authenticate, authorize("ADMIN"), deleteCraftDirectory);

module.exports = router;
