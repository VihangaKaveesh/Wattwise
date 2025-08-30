const Forecast = require("../../models/Forecast");

// @desc    Add forecast
// @route   POST /api/forecasts
// @access  Public
const addForecast = async (req, res) => {
  const { user, forecastDate, predictedConsumption, modelVersion } = req.body;

  if (!user || !forecastDate || !predictedConsumption) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const forecast = await Forecast.create({
    user,
    forecastDate,
    predictedConsumption,
    modelVersion,
  });

  res.status(201).json(forecast);
};

// @desc    Get all forecasts
// @route   GET /api/forecasts
// @access  Public
const getForecasts = async (req, res) => {
  const forecasts = await Forecast.find();
  res.json(forecasts);
};

// @desc    Get forecasts for a user
// @route   GET /api/forecasts/user/:userId
// @access  Public
const getForecastsByUser = async (req, res) => {
  const forecasts = await Forecast.find({ user: req.params.userId });
  res.json(forecasts);
};

module.exports = { addForecast, getForecasts, getForecastsByUser };
