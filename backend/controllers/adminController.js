const db = require("../config/db");

const getOverview = async (req, res) => {
  try {
    const [[userStats]] = await db.promise().query("SELECT COUNT(*) AS totalUsers FROM users");
    const [[accountStats]] = await db.promise().query("SELECT COUNT(*) AS totalAccounts, COALESCE(SUM(balance), 0) AS totalBalance FROM accounts");
    const [[transactionStats]] = await db.promise().query("SELECT COUNT(*) AS totalTransactions FROM transactions");
    const [[pendingStats]] = await db.promise().query(`
      SELECT
        (SELECT COUNT(*) FROM scheduled_transfers WHERE status = 'Scheduled') AS pendingTransfers,
        (SELECT COUNT(*) FROM loans WHERE status = 'Pending') AS pendingLoans,
        (SELECT COUNT(*) FROM cards WHERE is_frozen = 1) AS frozenCards,
        (SELECT COUNT(*) FROM notifications WHERE is_read = 0) AS unreadNotifications
    `);

    const [users] = await db.promise().query(`
      SELECT id, CONCAT(first_name, ' ', last_name) AS name, email, phone, role, created_at AS joined
      FROM users ORDER BY created_at DESC
    `);
    const [accounts] = await db.promise().query(`
      SELECT a.id, a.account_type AS account, a.account_number AS number, CONCAT(u.first_name, ' ', u.last_name) AS owner,
        a.balance, a.currency, a.status
      FROM accounts a JOIN users u ON u.id = a.user_id ORDER BY a.id DESC
    `);
    const [transactions] = await db.promise().query(`
      SELECT t.id, CONCAT(u.first_name, ' ', u.last_name) AS user, t.title, t.transaction_type, t.amount,
        t.status, t.transaction_date, t.reference
      FROM transactions t JOIN users u ON u.id = t.user_id ORDER BY t.transaction_date DESC
    `);
    const [transfers] = await db.promise().query(`
      SELECT t.id, t.reference AS transferId, CONCAT(u.first_name, ' ', u.last_name) AS sender,
        t.title AS recipient, ABS(t.amount) AS amount, t.transaction_type AS type, t.status,
        t.transaction_date AS date
      FROM transactions t JOIN users u ON u.id = t.user_id
      WHERE t.transaction_type LIKE 'Transfer%' ORDER BY t.transaction_date DESC
    `);
    const [cards] = await db.promise().query(`
      SELECT c.id, c.card_holder AS holder, c.card_number AS number, c.card_kind AS kind,
        c.spending_limit AS spendingLimit, c.status, c.is_frozen AS frozen
      FROM cards c ORDER BY c.created_at DESC
    `);
    const [loans] = await db.promise().query(`
      SELECT l.id, CONCAT(u.first_name, ' ', u.last_name) AS user, l.loan_type AS type,
        l.loan_amount AS amount, l.outstanding_balance AS outstanding, l.status
      FROM loans l JOIN users u ON u.id = l.user_id ORDER BY l.created_at DESC
    `);
    const [investments] = await db.promise().query(`
      SELECT i.id, CONCAT(u.first_name, ' ', u.last_name) AS user, i.investment_type AS category,
        i.amount AS invested, i.amount * (1 + (i.returns / 100)) AS value, i.returns AS returnRate, i.status
      FROM investments i JOIN users u ON u.id = i.user_id ORDER BY i.created_at DESC
    `);
    const [notifications] = await db.promise().query(`
      SELECT n.id, CONCAT(u.first_name, ' ', u.last_name) AS user, n.title, n.type,
        IF(n.is_read = 1, 'Read', 'Unread') AS status, n.created_at AS date, n.message
      FROM notifications n JOIN users u ON u.id = n.user_id ORDER BY n.created_at DESC LIMIT 50
    `);
    const [admins] = await db.promise().query(`
      SELECT id, CONCAT(first_name, ' ', last_name) AS name, email, role, created_at AS joined
      FROM users WHERE role IN ('admin', 'super_admin') ORDER BY created_at DESC
    `);
    const [monthlyTransactions] = await db.promise().query(`
      SELECT DATE_FORMAT(transaction_date, '%Y-%m') AS month, COUNT(*) AS count, COALESCE(SUM(ABS(amount)), 0) AS amount
      FROM transactions GROUP BY DATE_FORMAT(transaction_date, '%Y-%m') ORDER BY month DESC LIMIT 7
    `);
    const [[reportTotals]] = await db.promise().query(`
      SELECT
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS deposits,
        COALESCE(SUM(CASE WHEN amount < 0 AND transaction_type = 'Withdrawal' THEN ABS(amount) ELSE 0 END), 0) AS withdrawals,
        COALESCE(SUM(CASE WHEN transaction_type LIKE 'Transfer%' THEN ABS(amount) ELSE 0 END), 0) AS transfers,
        (SELECT COALESCE(SUM(outstanding_balance), 0) FROM loans) AS loanPortfolio
      FROM transactions
    `);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: Number(userStats.totalUsers),
          totalAccounts: Number(accountStats.totalAccounts),
          totalTransactions: Number(transactionStats.totalTransactions),
          totalBalance: Number(accountStats.totalBalance),
          ...Object.fromEntries(Object.entries(pendingStats).map(([key, value]) => [key, Number(value)])),
        },
        users,
        accounts,
        transactions,
        transfers,
        cards,
        loans,
        investments,
        notifications,
        admins,
        monthlyTransactions: monthlyTransactions.reverse(),
        reportTotals: Object.fromEntries(Object.entries(reportTotals).map(([key, value]) => [key, Number(value)])),
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ success: false, message: "Failed to load admin data" });
  }
};

const getSettings = async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT bank_name AS bankName, support_email AS supportEmail, support_phone AS supportPhone, maintenance_mode AS maintenanceMode, registration_enabled AS registrationEnabled, transfers_enabled AS transfersEnabled FROM admin_settings WHERE id = 1");
    res.json({ success: true, data: rows[0] || null });
  } catch {
    res.status(500).json({ success: false, message: "Failed to load settings" });
  }
};

const updateSettings = async (req, res) => {
  const { bankName, supportEmail, supportPhone, maintenanceMode, registrationEnabled, transfersEnabled } = req.body;
  try {
    await db.promise().query(`
      INSERT INTO admin_settings (id, bank_name, support_email, support_phone, maintenance_mode, registration_enabled, transfers_enabled)
      VALUES (1, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE bank_name = VALUES(bank_name), support_email = VALUES(support_email), support_phone = VALUES(support_phone),
        maintenance_mode = VALUES(maintenance_mode), registration_enabled = VALUES(registration_enabled), transfers_enabled = VALUES(transfers_enabled)
    `, [bankName || null, supportEmail || null, supportPhone || null, maintenanceMode ? 1 : 0, registrationEnabled ? 1 : 0, transfersEnabled ? 1 : 0]);
    res.json({ success: true, message: "Settings saved successfully" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to save settings" });
  }
};

module.exports = { getOverview, getSettings, updateSettings };