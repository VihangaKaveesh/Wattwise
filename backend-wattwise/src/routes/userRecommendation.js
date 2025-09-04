const express = require("express");
const router = express.Router();
const UserRecommendation = require("../models/userRecommendations");

// Add or update recommendation (overwrite if exists)
router.post("/", async (req, res) => {
  try {
    const { user, recommended_hours_per_day } = req.body;

    const recommendation = await UserRecommendation.findOneAndUpdate(
      { user }, // unique per user
      { recommended_hours_per_day },
      { new: true, upsert: true } // update existing or create new
    );

    res.status(200).json({ message: "Recommendation added/updated", recommendation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recommendation for a user
router.get("/:userId", async (req, res) => {
  try {
    const recommendation = await UserRecommendation.findOne({ user: req.params.userId });
    res.status(200).json(recommendation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
