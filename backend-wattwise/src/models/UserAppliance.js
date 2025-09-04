// models/UserAppliance.js
const mongoose = require("mongoose");

const ApplianceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hoursPerDay: { type: Number, default: 1.0 }
});

const UserApplianceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, required: true }, // e.g. "Colombo", "Galle", "Kandy"
    appliances: [ApplianceSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAppliance", UserApplianceSchema);
