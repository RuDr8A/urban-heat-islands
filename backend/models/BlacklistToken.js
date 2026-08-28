const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("BlacklistToken", blacklistTokenSchema);