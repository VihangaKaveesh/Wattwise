const mongoose = require("mongoose");

const monthlyDataSchema = new mongoose.Schema({
  month: { type: Number, required: true, unique: true }, // 1-12
  month_name: { type: String, required: true },
  avg_temp_c: { type: Number, required: true },
  rainy_days: { type: Number, required: true },
  public_holidays: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("MonthlyData", monthlyDataSchema);
