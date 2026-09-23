const db = require("../config/db");

const categoryFor = (type = "") => {
  const value = type.toLowerCase();
  if (value.includes("treasury") || value.includes("fixed")) return "Fixed income";
  if (value.includes("fund")) return "Funds";
  if (value.includes("stock") || value.includes("equity")) return "Equities";
  return "Other";
};

const riskFor = (type = "") => {
  const value = type.toLowerCase();
  if (value.includes("treasury") || value.includes("fixed")) return "Low";
  if (value.includes("balanced")) return "Moderate";
  return "Growth";
};

const buildDashboard = async (userId) => {
  const [investments] = await db.promise().query("SELECT id, user_id, investment_type, investment_type AS name, amount, returns, status, created_at FROM investments WHERE user_id = ? ORDER BY created_at DESC", [userId]);
  const [history] = await db.promise().query("SELECT id, investment_id, activity_type, investment_type, amount, price, created_at FROM investment_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 30", [userId]);
  const totalInvested = investments.reduce((total, item) => total + Number(item.amount || 0), 0);
  const totalReturns = investments.reduce((total, item) => total + Number(item.amount || 0) * (Number(item.returns || 0) / 100), 0);
  const categories = investments.reduce((result, item) => {
    const category = categoryFor(item.investment_type);
    result[category] = (result[category] || 0) + Number(item.amount || 0);
    return result;
  }, {});
  const performance = Array.from({ length: 6 }, (_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - index));
    const progress = totalReturns * ((index + 1) / 6);
    return { label: month.toLocaleDateString("en-US", { month: "short" }), value: Number((totalInvested + progress).toFixed(2)) };
  });
  return {
    investments: investments.map((item) => ({ ...item, category: categoryFor(item.investment_type), risk: riskFor(item.investment_type), current_value: Number(item.amount || 0) * (1 + Number(item.returns || 0) / 100) })),
    history,
    summary: { portfolioValue: totalInvested + totalReturns, totalInvested, totalReturns, profitLoss: totalReturns },
    categories,
    performance,
  };
};

const getInvestments = async (req, res) => {
  try { res.json({ success: true, data: (await buildDashboard(Number(req.user.id))).investments }); }
  catch { res.status(500).json({ success: false, message: "Failed to fetch investments" }); }
};

const getUserInvestments = async (req, res) => {
  if (Number(req.params.userId) !== Number(req.user.id)) return res.status(403).json({ success: false, message: "You can only view your own investments" });
  try {
    const dashboard = await buildDashboard(Number(req.user.id));
    res.json({ success: true, data: dashboard.investments, dashboard: { summary: dashboard.summary, categories: dashboard.categories, performance: dashboard.performance, history: dashboard.history } });
  } catch { res.status(500).json({ success: false, message: "Failed to fetch investment dashboard" }); }
};

const buyInvestment = async (req, res) => {
  const { name, amount } = req.body;
  const investmentAmount = Number(amount);
  if (!name || !Number.isFinite(investmentAmount) || investmentAmount <= 0) return res.status(400).json({ success: false, message: "Investment name and a positive amount are required" });
  try {
    const [result] = await db.promise().query("INSERT INTO investments (user_id, investment_type, amount, returns, status) VALUES (?, ?, ?, 0, 'Active')", [Number(req.user.id), name, investmentAmount]);
    await db.promise().query("INSERT INTO investment_activity (user_id, investment_id, activity_type, investment_type, amount, price) VALUES (?, ?, 'Buy', ?, ?, ?)", [Number(req.user.id), result.insertId, name, investmentAmount, investmentAmount]);
    const dashboard = await buildDashboard(Number(req.user.id));
    res.status(201).json({ success: true, message: "Investment purchased successfully", data: dashboard.investments.find((item) => item.id === result.insertId), dashboard: dashboard.summary });
  } catch { res.status(500).json({ success: false, message: "Failed to buy investment" }); }
};

const sellInvestment = async (req, res) => {
  const amount = Number(req.body.amount);
  const investmentId = Number(req.params.id);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Enter a valid sell amount" });
  try {
    const [rows] = await db.promise().query("SELECT * FROM investments WHERE id = ? AND user_id = ?", [investmentId, Number(req.user.id)]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Investment not found" });
    if (amount > Number(rows[0].amount)) return res.status(400).json({ success: false, message: "Sell amount exceeds your holding" });
    const remaining = Number(rows[0].amount) - amount;
    await db.promise().query("UPDATE investments SET amount = ?, status = ? WHERE id = ? AND user_id = ?", [remaining, remaining === 0 ? "Matured" : rows[0].status, investmentId, Number(req.user.id)]);
    await db.promise().query("INSERT INTO investment_activity (user_id, investment_id, activity_type, investment_type, amount, price) VALUES (?, ?, 'Sell', ?, ?, ?)", [Number(req.user.id), investmentId, rows[0].investment_type, amount, amount]);
    const dashboard = await buildDashboard(Number(req.user.id));
    res.json({ success: true, message: "Investment sold successfully", data: dashboard.investments, dashboard: dashboard.summary });
  } catch { res.status(500).json({ success: false, message: "Failed to sell investment" }); }
};

module.exports = { getInvestments, getUserInvestments, createInvestment: buyInvestment, buyInvestment, sellInvestment };
