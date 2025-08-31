const mongoose = require("mongoose");

const tariffSchema = new mongoose.Schema({
  scheme: { type: String, enum: ["<=60", ">60"], required: true }, // <=60 units, >60 units
  block: { type: String, required: true }, // "0-30", "31-60", "61-90", etc.
  kwh_from: { type: Number, required: true },
  kwh_to: { type: Number }, // can be null/undefined for "inf"
  energy_lkr_per_kwh: { type: Number, required: true },
  fixed_lkr: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Tariff", tariffSchema);
