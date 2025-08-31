const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  predictedConsumption: { type: Number, required: true }, // in kWh
  predictedAmount: { type: Number, required: true }       // in LKR
}, { timestamps: true });

module.exports = mongoose.model("Forecast", forecastSchema);
