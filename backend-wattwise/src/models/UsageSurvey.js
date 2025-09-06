const mongoose = require("mongoose");

const applianceUsageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usageHours: { type: Number, required: true } // Daily usage hours
}, { _id: false });

const usageSurveySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  people: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  appliances: [applianceUsageSchema],
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("UsageSurvey", usageSurveySchema);  