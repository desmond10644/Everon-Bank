const db = require("../config/db");

const getTransferData = async (req, res) => {
  const userId = Number(req.user.id);
  try {
    const [beneficiaries] = await db.promise().query(
      "SELECT id, name, account_number, bank_name, transfer_type, created_at FROM beneficiaries WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    const [scheduled] = await db.promise().query(
      "SELECT id, recipient_name, account_number, bank_name, amount, description, transfer_type, scheduled_for, status FROM scheduled_transfers WHERE user_id = ? ORDER BY scheduled_for ASC",
      [userId]
    );
    const [history] = await db.promise().query(
      "SELECT id, account_id, transaction_type, title, description, amount, transaction_date, status, reference FROM transactions WHERE user_id = ? AND transaction_type LIKE 'Transfer%' ORDER BY transaction_date DESC LIMIT 20",
      [userId]
    );
    res.json({ success: true, data: { beneficiaries, scheduled, history } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load transfer data" });
  }
};

const createBeneficiary = async (req, res) => {
  const { name, account_number, bank_name, transfer_type } = req.body;
  if (!name || !account_number || !bank_name) return res.status(400).json({ success: false, message: "Name, account number, and bank are required" });
  try {
    const [result] = await db.promise().query(
      "INSERT INTO beneficiaries (user_id, name, account_number, bank_name, transfer_type) VALUES (?, ?, ?, ?, ?)",
      [Number(req.user.id), name.trim(), account_number.trim(), bank_name.trim(), transfer_type || "bank"]
    );
    const [rows] = await db.promise().query("SELECT id, name, account_number, bank_name, transfer_type, created_at FROM beneficiaries WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save beneficiary" });
  }
};

const createTransfer = async (req, res) => {
  const userId = Number(req.user.id);
  const { transfer_type, sender_account_id, recipient_name, account_number, bank_name, amount, description, scheduled_for } = req.body;
  const transferAmount = Number(amount);
  if (!sender_account_id || !recipient_name || !account_number || !bank_name || !Number.isFinite(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({ success: false, message: "Complete the transfer details with a valid amount" });
  }

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    const [accounts] = await connection.query("SELECT id, account_name, balance FROM accounts WHERE id = ? AND user_id = ? FOR UPDATE", [sender_account_id, userId]);
    if (!accounts.length) throw new Error("Sending account not found");
    if (Number(accounts[0].balance) < transferAmount) throw new Error("Insufficient funds in the selected account");

    if (scheduled_for) {
      await connection.query(
        "INSERT INTO scheduled_transfers (user_id, sender_account_id, recipient_name, account_number, bank_name, amount, description, transfer_type, scheduled_for) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, sender_account_id, recipient_name.trim(), account_number.trim(), bank_name.trim(), transferAmount, description || null, transfer_type || "bank", scheduled_for]
      );
      await connection.commit();
      return res.status(201).json({ success: true, scheduled: true, message: "Transfer scheduled successfully" });
    }

    await connection.query("UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?", [transferAmount, sender_account_id, userId]);
    const reference = `TRF-${Date.now()}`;
    const title = `Transfer to ${recipient_name.trim()}`;
    const [transaction] = await connection.query(
      "INSERT INTO transactions (user_id, account_id, transaction_type, title, description, amount, transaction_date, status, reference) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'Completed', ?)",
      [userId, sender_account_id, `Transfer ${transfer_type || "bank"}`, title, description || `${title} via ${bank_name}`, -transferAmount, reference]
    );

    const [destination] = await connection.query("SELECT id FROM accounts WHERE account_number = ? LIMIT 1", [account_number.trim()]);
    if (destination.length && Number(destination[0].id) !== Number(sender_account_id)) {
      await connection.query("UPDATE accounts SET balance = balance + ? WHERE id = ?", [transferAmount, destination[0].id]);
      await connection.query(
        "INSERT INTO transactions (user_id, account_id, transaction_type, title, description, amount, transaction_date, status, reference) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'Completed', ?)",
        [userId, destination[0].id, `Transfer ${transfer_type || "bank"}`, `Transfer from ${accounts[0].account_name}`, description || "Incoming transfer", transferAmount, reference]
      );
    }
    await connection.commit();
    res.status(201).json({ success: true, data: { id: transaction.insertId, reference, amount: transferAmount, status: "Completed" }, message: "Transfer completed successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ success: false, message: error.message || "Transfer failed" });
  } finally {
    connection.release();
  }
};

module.exports = { getTransferData, createBeneficiary, createTransfer };
