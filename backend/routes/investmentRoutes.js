const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

const {
  getInvestments,
  getUserInvestments,
  createInvestment,
  sellInvestment,
} = require("../controllers/investmentController");


router.get("/", auth, getInvestments);

router.get("/user/:userId", auth, getUserInvestments);

router.post("/", auth, createInvestment);
router.post("/:id/sell", auth, sellInvestment);
 
module.exports = router;