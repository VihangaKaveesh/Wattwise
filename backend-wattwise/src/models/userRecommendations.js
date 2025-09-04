
const mongoose = require("mongoose");

const userRecommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  recommended_hours_per_day: {
    type: Map,
    of: Number,   // Each appliance maps to a number (hours per day)
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("UserRecommendation", userRecommendationSchema);
