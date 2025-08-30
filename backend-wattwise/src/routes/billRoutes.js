// routes/billRoutes.js
const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");

// Add a new bill
router.post("/", async (req, res) => {
  try {
    const { user, month, year, totalConsumption, totalAmount, tariffRate, paid } = req.body;
    const bill = new Bill({ user, month, year, totalConsumption, totalAmount, tariffRate, paid });
    await bill.save();
    res.status(201).json({ message: "Bill created", bill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bills
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().populate("user", "name email");
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bills for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.params.userId });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
