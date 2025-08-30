// models/Appliance.js
const mongoose = require("mongoose");

const applianceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  powerRating: { type: Number, required: true }, // in Watts
  category: { type: String, enum: ["lighting", "cooling", "heating", "kitchen", "other"], default: "other" },
}, { timestamps: true });

module.exports = mongoose.model("Appliance", applianceSchema);
