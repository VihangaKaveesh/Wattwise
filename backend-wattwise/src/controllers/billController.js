const Bill = require("../../models/Bill");

// @desc    Create bill
// @route   POST /api/bills
// @access  Public
const addBill = async (req, res) => {
  const { user, month, year, totalConsumption, totalAmount, tariffRate, paid } = req.body;

  if (!user || month == null || year == null || totalConsumption == null || totalAmount == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const bill = await Bill.create({
    user,
    month,
    year,
    totalConsumption,
    totalAmount,
    tariffRate,
    paid: paid || false,
  });

  res.status(201).json(bill);
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Public
const getBills = async (req, res) => {
  const bills = await Bill.find();
  res.json(bills);
};

// @desc    Get bills for a user
// @route   GET /api/bills/user/:userId
// @access  Public
const getBillsByUser = async (req, res) => {
  const bills = await Bill.find({ user: req.params.userId });
  res.json(bills);
};

module.exports = { addBill, getBills, getBillsByUser };
