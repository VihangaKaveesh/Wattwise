// models/Bill.js
const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true }, // e.g. 1 = Jan
  year: { type: Number, required: true },
  totalConsumption: { type: Number, required: true }, // kWh
  totalAmount: { type: Number, required: true }, // Currency (e.g., LKR or USD)
  tariffRate: { type: Number, required: true }, // Price per kWh
  paid: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Bill", billSchema);
