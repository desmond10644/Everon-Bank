const express = require("express");

const router = express.Router();

const {
  getTransactions,
  getUserTransactions,
  createTransaction,
} = require("../controllers/transactionController");


router.get("/", getTransactions);

router.get("/user/:userId", getUserTransactions);

router.post("/", createTransaction);


module.exports = router;