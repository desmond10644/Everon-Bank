const express = require("express");
const requireAdmin = require("../middleware/admin");
const { getOverview, getSettings, updateSettings } = require("../controllers/adminController");

const router = express.Router();

router.use(requireAdmin);
router.get("/overview", getOverview);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

module.exports = router;