const express = require("express");

const Tariff = require("../models/Tariff");
const MonthlyData = require("../models/MonthlyData");
const Appliance = require("../models/Appliances");

const router = express.Router();

// Helper: sanitize numeric fields
const sanitizeTariff = (row) => ({
  ...row,
  kwh_from: Number(row.kwh_from),
  kwh_to: row.kwh_to === "" || row.kwh_to === "inf" || row.kwh_to === undefined ? null : Number(row.kwh_to),
  energy_lkr_per_kwh: Number(row.energy_lkr_per_kwh),
  fixed_lkr: Number(row.fixed_lkr)
});

// POST /datasets/tariffs — Accept JSON array
router.post("/tariffs", async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const sanitized = rows.map(sanitizeTariff);

    const inserted = await Tariff.insertMany(sanitized);
    res.json({ message: "Tariff data uploaded", count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /datasets/monthly — Accept JSON array
router.post("/monthly", async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const inserted = await MonthlyData.insertMany(rows);
    res.json({ message: "MonthlyData uploaded", count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /datasets/appliances — Accept JSON array
router.post("/appliances", async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const inserted = await Appliance.insertMany(rows);
    res.json({ message: "Appliances uploaded", count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;