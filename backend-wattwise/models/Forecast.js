// models/Forecast.js
const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  forecastDate: { type: Date, default: Date.now },
  predictedConsumption: { type: Number, required: true }, // in kWh
  modelVersion: { type: String, default: "svm-v1" },
}, { timestamps: true });

module.exports = mongoose.model("Forecast", forecastSchema);
