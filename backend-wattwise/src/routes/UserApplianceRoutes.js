// routes/UserApplianceRoutes.js
const express = require("express");
const UserAppliance = require("../models/UserAppliance");
const router = express.Router();

// Create or update appliances for a user
router.post("/:userId", async (req, res) => {
  try {
    const { location, appliances } = req.body; // ✅ fix here
    let record = await UserAppliance.findOne({ userId: req.params.userId });

    if (record) {
      // Update existing record
      record.location = location || record.location;
      record.appliances = appliances;
      await record.save();
    } else {
      // Create new record
      record = await UserAppliance.create({
        userId: req.params.userId,
        location,
        appliances,
      });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// curl -X POST http://localhost:5000/api/user-appliances/64f8c9a7e3b4c2d4f9a12345 \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
//   -d '{
//     "location": "Colombo, Western Province",
//     "appliances": [
//       { "name": "Refrigerator (200–300L)", "hoursPerDay": 24 },
//       { "name": "Ceiling Fan", "hoursPerDay": 6 },
//       { "name": "Laptop", "hoursPerDay": 5 }
//     ]
//   }'




// Get all appliances for a user
router.get("/:userId", async (req, res) => {
  try {
    const record = await UserAppliance.findOne({ userId: req.params.userId });

     if (!record) {
      // ✅ Instead of error → return an empty list
      return res.json({
        userId: req.params.userId,
        appliances: [],
        message: "No appliances added for this user yet."
      });
    }
    res.json({
      userId: record.userId,
      location: record.location,
      appliances: record.appliances,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
  } catch (error) {
    console.error("Error fetching appliances:", error);
    res.status(500).json({ error: "Failed to fetch appliances" });
  }
});

// curl -X GET http://localhost:5000/api/user-appliances/64f8c9a7e3b4c2d4f9a12345 \
//   -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

// Delete all appliances for a user
router.delete("/:userId", async (req, res) => {
  try {
    const result = await UserAppliance.findOneAndDelete({ userId: req.params.userId });

    if (!result) {
      return res.status(404).json({ error: "No appliances found to delete" });
    }

    res.json({
      message: "Appliances deleted successfully",
      deletedRecord: {
        userId: result.userId,
        location: result.location,
        appliances: result.appliances
      }
    });
  } catch (error) {
    console.error("Error deleting appliances:", error);
    res.status(500).json({ error: "Failed to delete appliances" });
  }
});


module.exports = router;
