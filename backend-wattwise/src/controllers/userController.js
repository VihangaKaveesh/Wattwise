const User = require("../../models/User");
const bcrypt = require("bcryptjs");

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

module.exports = { registerUser, getUsers, getUserById };
