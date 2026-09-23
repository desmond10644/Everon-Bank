const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const {
  getNotifications,
  getUserNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} = require("../controllers/notificationController");

router.get("/", getNotifications);
router.get("/user/:userId", auth, getUserNotifications);
router.post("/", auth, createNotification);
router.patch("/:notificationId/read", auth, markNotificationRead);
router.patch("/read-all", auth, markAllNotificationsRead);
router.get("/preferences", auth, getNotificationPreferences);
router.patch("/preferences", auth, updateNotificationPreferences);

module.exports = router;
