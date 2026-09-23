const db = require("../config/db");

const interestFor = (accountType) => ({
  Savings: { rate: "4.25% APY", label: "Variable interest" },
  Current: { rate: "0.00% APY", label: "No monthly interest" },
  "Fixed Deposit": { rate: "7.50% APY", label: "Fixed for the term" },
  Student: { rate: "2.00% APY", label: "Student rate" },
  Business: { rate: "3.10% APY", label: "Variable interest" },
}[accountType] || { rate: "0.00% APY", label: "Standard rate" });

const addActivity = async (accounts) => {
  return Promise.all(accounts.map(async (account) => {
    const [activity] = await db.promise().query(
      "SELECT id, title, transaction_type, amount, transaction_date, status FROM transactions WHERE account_id = ? ORDER BY transaction_date DESC LIMIT 3",
      [account.id]
    );
    return { ...account, interest: interestFor(account.account_type), recent_activity: activity };
  }));
};

const getAccounts = (req, res) => {
  db.query("SELECT * FROM accounts ORDER BY id DESC", async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch accounts" });
    try { res.json({ success: true, data: await addActivity(results) }); }
    catch { res.status(500).json({ success: false, message: "Failed to fetch account activity" }); }
  });
};

const getUserAccounts = (req, res) => {
  const userId = Number(req.params.userId);
  if (!userId || userId !== Number(req.user.id)) return res.status(403).json({ success: false, message: "You can only view your own accounts" });
  db.query("SELECT * FROM accounts WHERE user_id = ? ORDER BY id DESC", [userId], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch user accounts" });
    try { res.json({ success: true, data: await addActivity(results) }); }
    catch { res.status(500).json({ success: false, message: "Failed to fetch account activity" }); }
  });
};

const getAccountDetails = async (req, res) => {
  try {
    const [accounts] = await db.promise().query("SELECT * FROM accounts WHERE id = ? AND user_id = ?", [Number(req.params.accountId), Number(req.user.id)]);
    if (!accounts.length) return res.status(404).json({ success: false, message: "Account not found" });
    const [data] = await addActivity(accounts);
    res.json({ success: true, data });
  } catch { res.status(500).json({ success: false, message: "Failed to fetch account details" }); }
};

module.exports = { getAccounts, getUserAccounts, getAccountDetails };
