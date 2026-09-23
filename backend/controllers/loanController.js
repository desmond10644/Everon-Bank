const db = require("../config/db");


const getLoans = (req, res) => {

  const sql = `
    SELECT *, loan_amount AS amount
    FROM loans
  `;

  db.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch loans",
      });
    }

    res.json({
      success: true,
      data: results,
    });

  });
};


const getUserLoans = (req, res) => {

  const userId = req.user.id;

  const sql = `
    SELECT *, loan_amount AS amount
    FROM loans
    WHERE user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user loans",
      });
    }

    res.json({
      success: true,
      data: results,
    });

  });
};
const createLoan = (req, res) => {
  const { loanType, amount } = req.body;
  const userId = req.user.id;

  if (!loanType || !amount || Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Loan type and a positive amount are required",
    });
  }

  const sql = `
    INSERT INTO loans (user_id, loan_type, loan_amount, outstanding_balance, status)
    VALUES (?, ?, ?, ?, 'Pending')
  `;

  db.query(sql, [userId, loanType, amount, amount], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to apply for loan",
      });
    }

    res.status(201).json({
      success: true,
      message: "Loan application submitted",
      data: {
        id: result.insertId,
        user_id: userId,
        loan_type: loanType,
        amount,
        outstanding_balance: amount,
        status: "Pending",
      },
    });
  });
};

module.exports = {
  getLoans,
  getUserLoans,
  createLoan,
};