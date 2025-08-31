const express = require("express");
const axios = require("axios");
const router = express.Router();

// POST to Python energy predictor
router.post('/predict-usage', async (req, res) => {
    try {
        const pythonResponse = await axios.post('http://localhost:5002/predict-usage', req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error calling energy predictor service:', error.message);
        res.status(500).json({error: 'Energy predictor service error', details: error.message});
    }
});

router.post('/recommend-budget', async (req, res) => {
    try {
        const pythonResponse = await axios.post('http://localhost:5001/recommend-budget', req.body);
        res.json(pythonResponse.data);
    } catch (error) {
        console.error('Error calling budget recommender service:', error.message);
        res.status(500).json({error: 'Budget recommender service error', details: error.message});
    }
});

module.exports = router;