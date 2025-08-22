// routes/forecastRoutes.js
const express = require("express");
const router = express.Router();
const Forecast = require("../models/Forecast");

// Add a new forecast
router.post("/", async (req, res) => {
  try {
    const { user, forecastDate, predictedConsumption, modelVersion } = req.body;
    const forecast = new Forecast({ user, forecastDate, predictedConsumption, modelVersion });
    await forecast.save();
    res.status(201).json({ message: "Forecast added", forecast });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all forecasts
router.get("/", async (req, res) => {
  try {
    const forecasts = await Forecast.find().populate("user", "name email");
    res.json(forecasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get forecasts for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const forecasts = await Forecast.find({ user: req.params.userId });
    res.json(forecasts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
