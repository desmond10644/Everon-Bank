const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

const {
  getCards,
  getUserCards,
  createCard,
  updateCard,
  changeCardPin,
  requestCardReplacement,
} = require("../controllers/cardController");


router.get("/", auth, getCards);

router.get("/user/:userId", auth, getUserCards);
router.post("/", auth, createCard);
router.patch("/:cardId", auth, updateCard);
router.patch("/:cardId/pin", auth, changeCardPin);
router.patch("/:cardId/replacement", auth, requestCardReplacement);


module.exports = router;