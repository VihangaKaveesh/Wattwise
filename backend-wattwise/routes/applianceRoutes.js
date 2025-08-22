// routes/applianceRoutes.js
const express = require("express");
const router = express.Router();
const Appliance = require("../models/Appliance");

// Add new appliance
router.post("/", async (req, res) => {
  try {
    const { user, name, type, powerRating, category } = req.body;
    const appliance = new Appliance({ user, name, type, powerRating, category });
    await appliance.save();
    res.status(201).json({ message: "Appliance added", appliance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all appliances
router.get("/", async (req, res) => {
  try {
    const appliances = await Appliance.find().populate("user", "name email");
    res.json(appliances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appliances for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const appliances = await Appliance.find({ user: req.params.userId });
    res.json(appliances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
