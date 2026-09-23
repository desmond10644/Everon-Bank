const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Essential for processing PIN and Profile updates

/**
 * Database Initialization
 * This ensures the notifications table exists. 
 * (You can add similar functions for other tables if needed)
 */
const ensureNotificationTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(20) DEFAULT 'info',
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  db.query(sql, (err) => {
    if (err) {
      console.error("Failed to initialize notifications table:", err.message);
      return;
    }
    console.log("✔ Notifications table ready");
    db.query(
      "ALTER TABLE notifications ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0",
      (alterErr) => {
        if (alterErr && alterErr.code !== "ER_DUP_FIELDNAME") {
          console.error("Failed to add notification read state:", alterErr.message);
        }
      }
    );
  });
};

const ensureLoanTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS loans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      loan_type VARCHAR(100) NOT NULL,
      loan_amount DECIMAL(15,2) NOT NULL,
      outstanding_balance DECIMAL(15,2) NOT NULL,
      status ENUM('Active', 'Paid', 'Pending', 'Rejected') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  db.query(sql, (err) => {
    if (err) {
      console.error("Failed to initialize loans table:", err.message);
      return;
    }
    console.log("Loans table ready");
  });
};

const ensureInvestmentTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS investments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      investment_type VARCHAR(100) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      returns DECIMAL(5,2) DEFAULT 0.00,
      status ENUM('Active', 'Growing', 'Matured') DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  db.query(sql, (err) => {
    if (err) {
      console.error("Failed to initialize investments table:", err.message);
      return;
    }
    console.log("Investments table ready");
  });
};

ensureNotificationTable();

db.query(`CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id INT PRIMARY KEY,
  email_notifications TINYINT(1) NOT NULL DEFAULT 1,
  sms_notifications TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`, (err) => {
  if (err && err.code !== "ER_NO_SUCH_TABLE") console.error("Failed to initialize notification preferences:", err.message);
});
ensureLoanTable();
ensureInvestmentTable();

db.query(`CREATE TABLE IF NOT EXISTS investment_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  investment_id INT NOT NULL,
  activity_type ENUM('Buy', 'Sell') NOT NULL,
  investment_type VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE
)`, (err) => {
  if (err && err.code !== "ER_NO_SUCH_TABLE") console.error("Failed to initialize investment activity:", err.message);
});

const ensureCardColumns = () => {
  const columns = [
    "ADD COLUMN card_kind ENUM('physical', 'virtual') DEFAULT 'physical'",
    "ADD COLUMN is_frozen TINYINT(1) NOT NULL DEFAULT 0",
    "ADD COLUMN spending_limit DECIMAL(15,2) DEFAULT 5000.00",
    "ADD COLUMN online_payments TINYINT(1) NOT NULL DEFAULT 1",
    "ADD COLUMN international_payments TINYINT(1) NOT NULL DEFAULT 0",
    "ADD COLUMN replacement_requested TINYINT(1) NOT NULL DEFAULT 0",
    "ADD COLUMN pin_hash VARCHAR(255) DEFAULT NULL",
    "ADD COLUMN pin_changed_at DATETIME DEFAULT NULL",
  ];
  columns.forEach((column) => db.query(`ALTER TABLE cards ${column}`, (err) => {
    if (err && err.code !== "ER_DUP_FIELDNAME" && err.code !== "ER_NO_SUCH_TABLE") console.error("Failed to initialize card column:", err.message);
  }));
};

ensureCardColumns();

const ensureTransferTables = () => {
  db.query(`CREATE TABLE IF NOT EXISTS beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    transfer_type VARCHAR(30) DEFAULT 'bank',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (err) => {
    if (err && err.code !== "ER_NO_SUCH_TABLE") console.error("Failed to initialize beneficiaries:", err.message);
  });
  db.query(`CREATE TABLE IF NOT EXISTS scheduled_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender_account_id INT NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    bank_name VARCHAR(150) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    transfer_type VARCHAR(30) DEFAULT 'bank',
    scheduled_for DATETIME NOT NULL,
    status VARCHAR(30) DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_account_id) REFERENCES accounts(id) ON DELETE CASCADE
  )`, (err) => {
    if (err && err.code !== "ER_NO_SUCH_TABLE") console.error("Failed to initialize scheduled transfers:", err.message);
  });
};

ensureTransferTables();

// --- ROUTE IMPORTS ---
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const cardRoutes = require("./routes/cardRoutes");
const loanRoutes = require("./routes/loanRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const transferRoutes = require("./routes/transferRoutes");
const adminRoutes = require("./routes/adminRoutes");

db.query(`CREATE TABLE IF NOT EXISTS admin_settings (
  id INT PRIMARY KEY,
  bank_name VARCHAR(150),
  support_email VARCHAR(255),
  support_phone VARCHAR(50),
  maintenance_mode TINYINT(1) NOT NULL DEFAULT 0,
  registration_enabled TINYINT(1) NOT NULL DEFAULT 0,
  transfers_enabled TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`, (err) => {
  if (err) console.error("Failed to initialize admin settings:", err.message);
});

// --- ROUTE REGISTRATION ---
// Auth routes (Login/Register)
app.use("/api/auth", authRoutes);

// User routes (Profile/PIN updates)
app.use("/api/users", userRoutes);

// Banking feature routes
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/admin", adminRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "VectorBank API is running"
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});