const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true },     // 1–12
  year: { type: Number, required: true },
  totalConsumption: { type: Number, required: true }, // in kWh
  totalAmount: { type: Number, required: true }       // in LKR
}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);
