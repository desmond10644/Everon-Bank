const db = require("../config/db");


const getTransactions = (req, res) => {
  const sql = `
    SELECT *
    FROM transactions
    ORDER BY transaction_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch transactions",
      });
    }

    res.json({
      success: true,
      data: results,
    });
  });
};


const getUserTransactions = (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT *
    FROM transactions
    WHERE user_id = ?
    ORDER BY transaction_date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user transactions",
      });
    }

    res.json({
      success: true,
      data: results,
    });
  });
};


const createTransaction = async (req, res) => {
  try {
    const {
      user_id,
      account_id,
      transaction_type,
      title,
      description,
      amount,
      transaction_date,
      status,
      reference,
    } = req.body;

    if (!user_id || typeof amount === 'undefined') {
      return res.status(400).json({ success: false, message: 'user_id and amount are required' });
    }

    let acctId = account_id;
    if (!acctId) {
      const [rows] = await db.promise().query(
        'SELECT id FROM accounts WHERE user_id = ? LIMIT 1',
        [user_id]
      );

      if (!rows || rows.length === 0) {
        return res.status(400).json({ success: false, message: 'No account found for user' });
      }

      acctId = rows[0].id;
    }

    const sql = `
      INSERT INTO transactions
      (user_id, account_id, transaction_type, title, description, amount, transaction_date, status, reference)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      user_id,
      acctId,
      transaction_type || 'Payment',
      title || description || '',
      description || null,
      amount,
      transaction_date || new Date(),
      status || 'Completed',
      reference || null,
    ];

    const [result] = await db.promise().query(sql, params);

    const [inserted] = await db.promise().query('SELECT * FROM transactions WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: inserted[0] });
  } catch (err) {
    console.error('Create transaction error:', err.message || err);
    res.status(500).json({ success: false, message: 'Failed to create transaction', error: err.message });
  }
};


module.exports = {
  getTransactions,
  getUserTransactions,
  createTransaction,
};