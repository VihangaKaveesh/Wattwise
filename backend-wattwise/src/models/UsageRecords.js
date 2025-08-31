const mongoose = require("mongoose");

const usageRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appliance: { type: mongoose.Schema.Types.ObjectId, ref: "Appliance", required: true },
  usageHours: { type: Number, required: true },  // per day or per entry
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("UsageRecord", usageRecordSchema);
