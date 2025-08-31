// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Load .env variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
require("./config/db");

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/appliances", require("./routes/applianceRoutes"));
app.use("/api/usage", require("./routes/usageRoutes"));
app.use("/api/forecasts", require("./routes/forecastRoutes"));
app.use("/api/bills", require("./routes/billRoutes"));
app.use("/api/python", require("./routes/python"));

// Default route
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});