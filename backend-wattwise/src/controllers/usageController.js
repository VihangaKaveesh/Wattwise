const UsageRecord = require("../../models/UsageRecords");

// @desc    Log usage
// @route   POST /api/usage
// @access  Public
const addUsage = async (req, res) => {
  const { user, appliance, usageHours } = req.body;
  if (!user || !appliance || usageHours == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const usageRecord = await UsageRecord.create({
    user,
    appliance,
    usageHours,
  });

  res.status(201).json(usageRecord);
};

// @desc    Get all usage records
// @route   GET /api/usage
// @access  Public
const getUsageRecords = async (req, res) => {
  const records = await UsageRecord.find();
  res.json(records);
};

// @desc    Get usage records for a user
// @route   GET /api/usage/user/:userId
// @access  Public
const getUsageByUser = async (req, res) => {
  const records = await UsageRecord.find({ user: req.params.userId });
  res.json(records);
};

module.exports = { addUsage, getUsageRecords, getUsageByUser };
