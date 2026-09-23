const express = require("express");
const auth = require("../middleware/auth");
const { getTransferData, createBeneficiary, createTransfer } = require("../controllers/transferController");

const router = express.Router();
router.get("/data", auth, getTransferData);
router.post("/beneficiaries", auth, createBeneficiary);
router.post("/", auth, createTransfer);

module.exports = router;
