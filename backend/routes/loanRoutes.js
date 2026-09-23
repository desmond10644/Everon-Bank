const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

const {
  getLoans,
  getUserLoans,
  createLoan,
} = require("../controllers/loanController");


router.get("/", getLoans);

router.get("/user/:userId", auth, getUserLoans);

router.post("/", auth, createLoan);


module.exports = router;