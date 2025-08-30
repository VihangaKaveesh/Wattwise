// routes/usageRoutes.js
const express = require("express");
const router = express.Router();
const UsageRecord = require("../models/UsageRecords");

// Log a usage record
router.post("/", async (req, res) => {
  try {
    const { user, appliance, usageHours } = req.body;
    const usage = new UsageRecord({ user, appliance, usageHours });
    await usage.save();
    res.status(201).json({ message: "Usage recorded", usage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all usage records
router.get("/", async (req, res) => {
  try {
    const usageRecords = await UsageRecord.find().populate("user appliance");
    res.json(usageRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get usage for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const usageRecords = await UsageRecord.find({ user: req.params.userId }).populate("appliance");
    res.json(usageRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
