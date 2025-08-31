const mongoose = require("mongoose");

const applianceSchema = new mongoose.Schema({
  name: { type: String, required: true },       // from "appliance" column
  typical_w: { type: Number, required: true },
  min_w: { type: Number, required: true },
  max_w: { type: Number, required: true },
  standby_w: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Appliance", applianceSchema);
