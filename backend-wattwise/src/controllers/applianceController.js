const Appliance = require("../../models/Appliances");

// @desc    Add new appliance
// @route   POST /api/appliances
// @access  Public
const addAppliance = async (req, res) => {
  try {
    const { user, name, powerRating, category } = req.body;

    if (!user || !name || !powerRating) {
      return res.status(400).json({ message: "Please add required fields" });
    }

    const appliance = await Appliance.create({
      user,
      name,
      powerRating,
      category: category || "other",
    });

    res.status(201).json(appliance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all appliances
// @route   GET /api/appliances
// @access  Public
const getAppliances = async (req, res) => {
  try {
    const appliances = await Appliance.find().populate("user", "name email");
    res.json(appliances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get appliances for a user
// @route   GET /api/appliances/user/:userId
// @access  Public
const getAppliancesByUser = async (req, res) => {
  try {
    const appliances = await Appliance.find({ user: req.params.userId });
    res.json(appliances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addAppliance, getAppliances, getAppliancesByUser };
