const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

const {
  getAccounts,
  getUserAccounts,
  getAccountDetails,
} = require("../controllers/accountController");


router.get("/", auth, getAccounts);

router.get("/user/:userId", auth, getUserAccounts);
router.get("/:accountId", auth, getAccountDetails);


module.exports = router;