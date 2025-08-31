// routes/applianceRoutes.js
const express = require("express");
const router = express.Router();
const Appliance = require("../models/Appliances");

// Add new appliance
router.post("/", async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const inserted = await Appliance.insertMany(rows);
    res.status(201).json({ message: "Appliances added", count: inserted.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /appliances — Get all appliances
router.get("/", async (req, res) => {
  try {
    const appliances = await Appliance.find();
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
