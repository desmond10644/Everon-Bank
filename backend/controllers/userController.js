const db = require("../config/db");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      "SELECT id, first_name, last_name, email, phone, address, account_type, role FROM users"
    );

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      "SELECT id, first_name, last_name, email, phone, address, account_type, role FROM users WHERE id = ?",
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, fullName, email, phone, address, accountType } = req.body;
    const nameParts = (fullName || "").trim().split(/\s+/).filter(Boolean);
    const resolvedFirstName = firstName ?? nameParts.shift() ?? null;
    const resolvedLastName = lastName ?? (nameParts.join(" ") || null);

    const [result] = await db.promise().query(
      "UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), email = COALESCE(?, email), phone = COALESCE(?, phone), address = COALESCE(?, address), account_type = COALESCE(?, account_type) WHERE id = ?",
      [resolvedFirstName, resolvedLastName, email, phone, address, accountType, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 1. GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.promise().query(
      "SELECT id, first_name, last_name, email, phone, address, account_type FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) return res.status(404).json({ success: false });

    const user = rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        accountType: user.account_type
      }
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, fullName, email, phone, address } = req.body;
    const nameParts = (fullName || "").trim().split(/\s+/).filter(Boolean);
    const resolvedFirstName = firstName ?? nameParts.shift() ?? null;
    const resolvedLastName = lastName ?? (nameParts.join(" ") || null);

    await db.promise().query(
      "UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), email = COALESCE(?, email), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?",
      [resolvedFirstName, resolvedLastName, email, phone, address, userId]
    );

    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. UPDATE PIN
const updatePin = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pin } = req.body;

    console.log("Updating PIN for user:", userId);

    await db.promise().query(
      "UPDATE users SET transaction_pin = ? WHERE id = ?",
      [pin, userId]
    );

    res.json({ success: true, message: "PIN updated successfully" });
  } catch (error) {
    console.error("PIN Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Current password and a new password of at least 8 characters are required",
      });
    }

    const [users] = await db.promise().query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const matches = await bcrypt.compare(currentPassword, users[0].password);
    if (!matches) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.promise().query(
      "UPDATE users SET password = ? WHERE id = ?",
      [passwordHash, req.user.id]
    );

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  getProfile,
  updateProfile,
  updatePin,
  changePassword,
};