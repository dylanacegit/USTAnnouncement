const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const connectDB = require("../db");
const { getEffectiveRole, sanitizeUser } = require("../utils/auth");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const db = await connectDB();
    const user = await db.collection("users").findOne({ _id: new ObjectId(payload.id) });

    if (!user) {
      return res.status(401).json({ message: "Account no longer exists." });
    }

    if ((user.account_status || "active") !== "active") {
      return res.status(403).json({ message: "This account is archived." });
    }

    req.auth = payload;
    req.userRecord = user;
    req.user = sanitizeUser(user);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}

function requireAdmin(req, res, next) {
  if (getEffectiveRole(req.userRecord) !== "admin") {
    return res.status(403).json({ message: "Admin access is required." });
  }

  next();
}

module.exports = {
  requireAdmin,
  requireAuth,
};
