const mongoose = require("mongoose");

const forecastSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true },   // the month the forecast is generated for
  year: { type: Number, required: true },    // the year of the forecast
  predictions: {
    this_month: {
      predicted_kwh: { type: Number, required: true },
      predicted_bill_lkr: { type: Number, required: true }
    },
    next_month: {
      predicted_kwh: { type: Number, required: true },
      predicted_bill_lkr: { type: Number, required: true }
    }
  },
  modelVersion: { type: String } // optional
}, { timestamps: true });

module.exports = mongoose.model("Forecast", forecastSchema);
