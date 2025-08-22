// models/UsageRecord.js
const mongoose = require("mongoose");

const usageRecordSchema = new mongoose.Schema({
  appliance: { type: mongoose.Schema.Types.ObjectId, ref: "Appliance", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  usageHours: { type: Number, required: true }, // Hours per day
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("UsageRecord", usageRecordSchema);
