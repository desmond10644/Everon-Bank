const db = require("../config/db");

const getNotifications = (req, res) => {
  const sql = `
    SELECT *
    FROM notifications
    ORDER BY created_at DESC
    LIMIT 50
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
        error: err.message,
      });
    }

    res.json({
      success: true,
      data: results,
    });
  });
};

const getUserNotifications = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT *
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user notifications",
        error: err.message,
      });
    }

    res.json({
      success: true,
      data: results,
    });
  });
};

const getNotificationPreferences = (req, res) => {
  db.query(
    "SELECT email_notifications, sms_notifications FROM notification_preferences WHERE user_id = ?",
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to fetch notification preferences" });
      const preferences = results[0] || { email_notifications: 1, sms_notifications: 0 };
      res.json({ success: true, data: preferences });
    }
  );
};

const updateNotificationPreferences = (req, res) => {
  const emailNotifications = req.body.email_notifications ? 1 : 0;
  const smsNotifications = req.body.sms_notifications ? 1 : 0;
  db.query(
    `INSERT INTO notification_preferences (user_id, email_notifications, sms_notifications)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE email_notifications = VALUES(email_notifications), sms_notifications = VALUES(sms_notifications)`,
    [req.user.id, emailNotifications, smsNotifications],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to save notification preferences" });
      res.json({ success: true, data: { email_notifications: emailNotifications, sms_notifications: smsNotifications } });
    }
  );
};

const createNotification = (req, res) => {
  const { type = "info", title, message } = req.body;
  const user_id = req.user.id;

  if (!user_id || !title || !message) {
    return res.status(400).json({
      success: false,
      message: "user_id, title and message are required",
    });
  }

  const sql = `
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, type, title, message], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to create notification",
        error: err.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notificationId: result.insertId,
    });
  });
};

const markNotificationRead = (req, res) => {
  const userId = req.user.id;
  const { notificationId } = req.params;

  db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [notificationId, userId],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to mark notification as read",
        });
      }

      res.json({ success: true });
    }
  );
};

const markAllNotificationsRead = (req, res) => {
  db.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Failed to mark notifications as read",
        });
      }

      res.json({ success: true });
    }
  );
};

module.exports = {
  getNotifications,
  getUserNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
};
