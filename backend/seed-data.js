require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const seed = async () => {
  db.connect(async (connectErr) => {
    if (connectErr) {
      console.error('DB_CONNECT_ERROR:', connectErr.message);
      process.exit(1);
    }

    try {
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(20),
          address VARCHAR(255),
          account_type VARCHAR(100),
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(20) DEFAULT 'info',
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_read TINYINT(1) NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS notification_preferences (
          user_id INT PRIMARY KEY,
          email_notifications TINYINT(1) NOT NULL DEFAULT 1,
          sms_notifications TINYINT(1) NOT NULL DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      await db.promise().query(
        "ALTER TABLE notifications ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0"
      ).catch((error) => {
        if (error.code !== 'ER_DUP_FIELDNAME') throw error;
      });

      await db.promise().query(`
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
      `);

      await db.promise().query(`
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
      `);

      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS investment_activity (
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
        )
      `);

      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS beneficiaries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(150) NOT NULL,
          account_number VARCHAR(50) NOT NULL,
          bank_name VARCHAR(150) NOT NULL,
          transfer_type VARCHAR(30) DEFAULT 'bank',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS scheduled_transfers (
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
        )
      `);

      await db.promise().query(`
        CREATE TABLE IF NOT EXISTS cards (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          account_id INT DEFAULT NULL,
          card_type ENUM('Visa', 'MasterCard', 'Visa Platinum') NOT NULL,
          card_number VARCHAR(20) NOT NULL UNIQUE,
          card_holder VARCHAR(100) NOT NULL,
          expiry_date VARCHAR(7) NOT NULL,
          balance DECIMAL(15,2) DEFAULT 0.00,
          status ENUM('Active', 'Blocked', 'Expired') DEFAULT 'Active',
          card_kind ENUM('physical', 'virtual') DEFAULT 'physical',
          is_frozen TINYINT(1) NOT NULL DEFAULT 0,
          spending_limit DECIMAL(15,2) DEFAULT 5000.00,
          online_payments TINYINT(1) NOT NULL DEFAULT 1,
          international_payments TINYINT(1) NOT NULL DEFAULT 0,
          replacement_requested TINYINT(1) NOT NULL DEFAULT 0,
          pin_hash VARCHAR(255) DEFAULT NULL,
          pin_changed_at DATETIME DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
        )
      `);

      await db.promise().query('DELETE FROM notifications');
      await db.promise().query('DELETE FROM notification_preferences');
      await db.promise().query('DELETE FROM scheduled_transfers');
      await db.promise().query('DELETE FROM beneficiaries');
      await db.promise().query('DELETE FROM loans');
      await db.promise().query('DELETE FROM investment_activity');
      await db.promise().query('DELETE FROM investments');
      await db.promise().query('DELETE FROM transactions');
      await db.promise().query('DELETE FROM cards');
      await db.promise().query('DELETE FROM accounts');
      await db.promise().query('DELETE FROM users');

      await db.promise().query('ALTER TABLE users AUTO_INCREMENT = 1');
      await db.promise().query('ALTER TABLE accounts AUTO_INCREMENT = 1');
      await db.promise().query('ALTER TABLE transactions AUTO_INCREMENT = 1');
      await db.promise().query('ALTER TABLE cards AUTO_INCREMENT = 1');
      await db.promise().query('ALTER TABLE notifications AUTO_INCREMENT = 1');

      const passwordHash = await bcrypt.hash('Password123!', 10);

      const users = [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '08012345678',
          address: 'Lagos, Nigeria',
          account_type: 'Personal Checking',
          password: passwordHash,
          role: 'user',
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane@example.com',
          phone: '08098765432',
          address: 'Abuja, Nigeria',
          account_type: 'Personal Savings',
          password: passwordHash,
          role: 'user',
        },
      ];

      const [userResult] = await db.promise().query(
        'INSERT INTO users (first_name, last_name, email, phone, address, account_type, password, role) VALUES ?',
        [users.map((u) => [u.first_name, u.last_name, u.email, u.phone, u.address, u.account_type, u.password, u.role])]
      );

      const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 10);
      await db.promise().query(
        'INSERT INTO users (first_name, last_name, email, phone, address, account_type, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          process.env.ADMIN_FIRST_NAME || 'Bank',
          process.env.ADMIN_LAST_NAME || 'Administrator',
          process.env.ADMIN_EMAIL || 'admin@mybank.com',
          null,
          null,
          null,
          adminPasswordHash,
          'super_admin',
        ]
      );

      const accountRows = [
        [1, 'Main Checking', '1002345678', 'Current', 8540.42, 'USD', 'Active'],
        [1, 'Emergency Savings', '1002345679', 'Savings', 18250.8, 'USD', 'Active'],
        [2, 'Personal Account', '2009876543', 'Current', 6400.5, 'USD', 'Active'],
      ];

      const [accountResult] = await db.promise().query(
        'INSERT INTO accounts (user_id, account_name, account_number, account_type, balance, currency, status) VALUES ?',
        [accountRows]
      );

      const transactionRows = [
        [1, 1, 'Salary', 'Salary deposit', 'Salary deposit', 3200.00, '2026-08-18 09:00:00', 'Completed', 'REF-001'],
        [1, 1, 'Withdrawal', 'Groceries', 'Groceries', -145.75, '2026-08-20 12:10:00', 'Completed', 'REF-002'],
        [1, 1, 'Payment', 'Netflix', 'Netflix subscription', -18.99, '2026-08-22 18:45:00', 'Completed', 'REF-003'],
        [2, 3, 'Salary', 'Freelance payout', 'Freelance payout', 1250.00, '2026-08-24 09:35:00', 'Completed', 'REF-004'],
        [2, 3, 'Payment', 'Rent payment', 'Monthly rent', -950.00, '2026-08-25 14:20:00', 'Completed', 'REF-005'],
      ];

      const [transactionResult] = await db.promise().query(
        'INSERT INTO transactions (user_id, account_id, transaction_type, title, description, amount, transaction_date, status, reference) VALUES ?',
        [transactionRows]
      );

      const cardRows = [
        [1, 1, 'Visa', '4242424242424242', 'John Doe', '09/29', 8540.42, 'Active'],
        [2, 3, 'MasterCard', '5555555555554444', 'Jane Smith', '12/28', 6400.50, 'Active'],
      ];

      const [cardResult] = await db.promise().query(
        'INSERT INTO cards (user_id, account_id, card_type, card_number, card_holder, expiry_date, balance, status) VALUES ?',
        [cardRows]
      );

      const notifications = [
        [1, 'bank-update', 'Bank Update', 'Your account dashboard is synced and ready to use.'],
        [1, 'transaction', 'Transaction', 'A transfer of $250.00 is scheduled for tomorrow morning.'],
        [2, 'security', 'Security Alert', 'A new login was detected from a new device.'],
        [2, 'transaction', 'Credit Alert', 'A credit of $1,250.00 has been added to your account.'],
        [2, 'bank-update', 'Bank Update', 'Your upcoming rent payment is scheduled for tomorrow.'],
      ];

      const [notificationResult] = await db.promise().query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES ?',
        [notifications]
      );

      const loanRows = [
        [1, 'Personal Loan', 5000.00, 3250.00, 'Active'],
        [2, 'Home Improvement Loan', 12000.00, 0.00, 'Paid'],
      ];

      const [loanResult] = await db.promise().query(
        'INSERT INTO loans (user_id, loan_type, loan_amount, outstanding_balance, status) VALUES ?',
        [loanRows]
      );

      const investmentRows = [
        [1, 'Balanced Growth Fund', 2500.00, 8.50, 'Growing'],
        [2, 'Treasury Bills', 4000.00, 5.25, 'Active'],
      ];

      const [investmentResult] = await db.promise().query(
        'INSERT INTO investments (user_id, investment_type, amount, returns, status) VALUES ?',
        [investmentRows]
      );

      await db.promise().query(
        'INSERT INTO investment_activity (user_id, investment_id, activity_type, investment_type, amount, price) VALUES ?',
        [investmentRows.map((investment, index) => [investment[0], investmentResult.insertId + index, 'Buy', investment[1], investment[2], investment[2]])]
      );

      console.log(JSON.stringify({
        usersInserted: userResult.affectedRows,
        accountsInserted: accountResult.affectedRows,
        transactionsInserted: transactionResult.affectedRows,
        cardsInserted: cardResult.affectedRows,
        notificationsInserted: notificationResult.affectedRows,
        loansInserted: loanResult.affectedRows,
        investmentsInserted: investmentResult.affectedRows,
        loginEmail: 'john@example.com',
        loginPassword: 'Password123!',
      }, null, 2));

      db.end();
    } catch (error) {
      console.error('SEED_ERROR:', error.message);
      db.end();
      process.exit(1);
    }
  });
};

seed();
