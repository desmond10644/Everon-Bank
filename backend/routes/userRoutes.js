const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUserById,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

const auth = require("../middleware/auth");


router.get("/", getUsers);

// Profile routes for logged-in user must be defined before /:id
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.patch("/password", auth, changePassword);

router.get("/:id", getUserById);
router.put("/:id", require("../controllers/userController").updateUser);


module.exports = router;