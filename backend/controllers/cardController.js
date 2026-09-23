const db = require("../config/db");
const bcrypt = require("bcryptjs");


const getCards = (req, res) => {

  const sql = `
    SELECT *
    FROM cards
  `;

  db.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch cards",
      });
    }

    res.json({
      success: true,
      data: results,
    });

  });
};


const getUserCards = (req, res) => {

  const userId = Number(req.params.userId);

  if (!userId || userId !== Number(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "You can only view your own cards",
    });
  }

  const sql = `
    SELECT *
    FROM cards
    WHERE user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user cards",
      });
    }

    res.json({
      success: true,
      data: results,
    });

  });
};


const getOwnedCard = async (cardId, userId) => {
  const [cards] = await db.promise().query(
    "SELECT * FROM cards WHERE id = ? AND user_id = ?",
    [cardId, userId]
  );
  return cards[0];
};


const createCard = async (req, res) => {
  const cardKind = req.body.card_kind === "virtual" ? "virtual" : "physical";

  try {
    const [[user]] = await db.promise().query("SELECT full_name FROM users WHERE id = ?", [req.user.id]);
    const [[account]] = await db.promise().query("SELECT id FROM accounts WHERE user_id = ? ORDER BY id LIMIT 1", [req.user.id]);
    if (!user || !account) return res.status(400).json({ success: false, message: "A user account is required to create a card" });

    const cardNumber = `${Date.now()}`.slice(-16).padStart(16, "4");
    const expiryDate = `${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(new Date().getFullYear() + 4).slice(-2)}`;
    const [result] = await db.promise().query(
      "INSERT INTO cards (user_id, account_id, card_type, card_number, card_holder, expiry_date, card_kind) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, account.id, "Visa", cardNumber, user.full_name, expiryDate, cardKind]
    );
    res.status(201).json({ success: true, data: await getOwnedCard(result.insertId, req.user.id) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create card" });
  }
};


const updateCard = async (req, res) => {
  const allowedFields = ["is_frozen", "online_payments", "international_payments", "spending_limit"];
  const updates = Object.entries(req.body).filter(([field]) => allowedFields.includes(field));
  if (!updates.length) return res.status(400).json({ success: false, message: "No valid card changes provided" });

  try {
    const card = await getOwnedCard(req.params.cardId, req.user.id);
    if (!card) return res.status(404).json({ success: false, message: "Card not found" });
    const setClause = updates.map(([field]) => `${field} = ?`).join(", ");
    await db.promise().query(`UPDATE cards SET ${setClause} WHERE id = ? AND user_id = ?`, [...updates.map(([, value]) => value), req.params.cardId, req.user.id]);
    res.json({ success: true, data: await getOwnedCard(req.params.cardId, req.user.id) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update card" });
  }
};


const changeCardPin = async (req, res) => {
  const { pin } = req.body;
  if (!/^\d{4}$/.test(String(pin || ""))) return res.status(400).json({ success: false, message: "PIN must be exactly 4 digits" });

  try {
    const card = await getOwnedCard(req.params.cardId, req.user.id);
    if (!card) return res.status(404).json({ success: false, message: "Card not found" });
    const pinHash = await bcrypt.hash(String(pin), 10);
    await db.promise().query("UPDATE cards SET pin_hash = ?, pin_changed_at = NOW() WHERE id = ? AND user_id = ?", [pinHash, req.params.cardId, req.user.id]);
    res.json({ success: true, data: await getOwnedCard(req.params.cardId, req.user.id) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to change card PIN" });
  }
};


const requestCardReplacement = async (req, res) => {
  try {
    const card = await getOwnedCard(req.params.cardId, req.user.id);
    if (!card) return res.status(404).json({ success: false, message: "Card not found" });
    await db.promise().query("UPDATE cards SET replacement_requested = 1 WHERE id = ? AND user_id = ?", [req.params.cardId, req.user.id]);
    res.json({ success: true, data: await getOwnedCard(req.params.cardId, req.user.id) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to request card replacement" });
  }
};


module.exports = {
  getCards,
  getUserCards,
  createCard,
  updateCard,
  changeCardPin,
  requestCardReplacement,
};