const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      accountType,
      password
    } = req.body;

    // 1. Updated validation for the new fields
    if (!firstName || !lastName || !email || !phone || !accountType || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // 2. Check if user already exists
    const [existingUser] = await db
      .promise()
      .query(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Updated Insert query with new columns: first_name, last_name, account_type
    const [result] = await db
      .promise()
      .query(
        `INSERT INTO users
        (first_name, last_name, email, phone, account_type, password)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          firstName,
          lastName,
          email,
          phone,
          accountType,
          hashedPassword
        ]
      );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: result.insertId
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};


const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user
    const [users] = await db
      .promise()
      .query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Create token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    // 5. Updated response to send back firstName and lastName
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        accountType: user.account_type,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};


module.exports = {
  register,
  login
};