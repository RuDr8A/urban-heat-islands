const jwt = require("jsonwebtoken");
const BlacklistToken = require("../models/BlacklistToken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Authentication required" });

    const blacklistedToken = await BlacklistToken.findOne({ token });
    if (blacklistedToken) return res.status(401).json({ message: "Session expired. Please login again." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;