
const express = require("express");

const {
    getPublicCrafts,
    getCraftDetail,
    getAdminCrafts,
    createCraft,
    updateCraft,
    deleteCraft,
} = require("../controllers/craftController");

const {
    authenticate,
    authorize,
} = require("../middlewares/authMiddleware");

// ROUTES CÔNG KHAI
const publicRouter = express.Router();

publicRouter.get("/", getPublicCrafts);
publicRouter.get("/:id", getCraftDetail);

// ROUTES ADMIN
const adminRouter = express.Router();

adminRouter.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    getAdminCrafts
);

adminRouter.post(
    "/",
    authenticate,
    authorize("ADMIN"),
    createCraft
);

adminRouter.put(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    updateCraft
);

adminRouter.delete(
    "/:id",
    authenticate,
    authorize("ADMIN"),
    deleteCraft
);

module.exports = {
    publicRouter,
    adminRouter,
};
