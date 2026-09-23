const auth = require("./auth");

const requireAdmin = (req, res, next) => {
  auth(req, res, () => {
    if (!req.user || !["admin", "super_admin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Administrator access required" });
    }

    next();
  });
};

module.exports = requireAdmin;