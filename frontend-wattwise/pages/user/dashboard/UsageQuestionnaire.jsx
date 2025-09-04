// src/pages/dashboard/UsageQuestionnaire.jsx
import React, { useState } from 'react';
import axios from 'axios'; // Using axios directly for the Python service
import './styles/UsageQuestionnaire.css';
import { useLocation } from 'react-router-dom';

// Mock appliance list - in a real app, fetch this from your Node.js backend
// For example: GET /api/appliances
const AVAILABLE_APPLIANCES = [
  "Ceiling Fan", "Refrigerator (200–300L)", "LED TV (40–50 in)",
  "Rice Cooker", "Electric Kettle", "Washing Machine (6-8kg)",
  "Laptop", "Desktop Computer", "Incandescent Bulb (60W)", "LED Bulb (9W)"
];

// Main component
export default function UsageQuestionnaire() {
  const [people, setPeople] = useState(2);
  const [selectedAppliances, setSelectedAppliances] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
   const location = useLocation();
  const { userId } = location.state || {};

  const handleApplianceChange = (appliance) => {
    setSelectedAppliances(prev => {
      const newSelection = { ...prev };
      if (newSelection[appliance]) {
        delete newSelection[appliance]; // Deselect
      } else {
        newSelection[appliance] = { usage: 1 }; // Select with default 1 hour
      }
      return newSelection;
    });
  };

  // Ensure usage hours are between 0 and 24
  const handleUsageChange = (appliance, usage) => {
    const newUsage = Math.max(0, Math.min(24, parseFloat(usage) || 0));
    setSelectedAppliances(prev => ({
      ...prev,
      [appliance]: { ...prev[appliance], usage: newUsage }
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  setPrediction(null);

  // Prepare payload for Python service
  const payload = {
    people: parseInt(people, 10),
    month: new Date().getMonth() + 1,
    appliances: Object.keys(selectedAppliances),
    hours_per_day: Object.entries(selectedAppliances).reduce((acc, [name, data]) => {
      acc[name] = data.usage;
      return acc;
    }, {})
  };

  try {
    // 1️⃣ Call the Python Flask API
    const response = await axios.post('http://localhost:5002/predict-usage', payload);
    setPrediction(response.data);

    // 2️⃣ Prepare payload for Node.js backend (MongoDB)
    const forecastPayload = {
      user: userId,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      predictions: response.data,
      modelVersion: "v1.0"
    };

    // 3️⃣ Send to Node.js backend
    await axios.post('http://localhost:5000/api/forecast', forecastPayload);

  } catch (err) {
    setError('Failed to get prediction or save forecast. Please try again.');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};



  // Render the form and results
  return (
    <div className="questionnaire-page">
      <div className="questionnaire-container">
        <div className="questionnaire-header">
          <h1>Energy Usage Survey</h1>
          <p>Fill this out to predict your next electricity bill.</p>
        </div>

        <form onSubmit={handleSubmit} className="questionnaire-form">
          <div className="form-section">
            <label htmlFor="people">How many people live in your house?</label>
            <input
              id="people"
              type="number"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              min="1"
              className="people-input"
            />
          </div>

          <div className="form-section">
            <label>Which appliances do you use regularly?</label>
            <div className="appliances-grid">
              {AVAILABLE_APPLIANCES.map(appliance => (
                <div key={appliance} className="appliance-item">
                  <input
                    type="checkbox"
                    id={appliance}
                    checked={!!selectedAppliances[appliance]}
                    onChange={() => handleApplianceChange(appliance)}
                  />
                  <label htmlFor={appliance}>{appliance}</label>
                </div>
              ))}
            </div>
          </div>
          
          {Object.keys(selectedAppliances).length > 0 && (
            <div className="form-section">
              <label>How many hours per day do you use them?</label>
              <div className="usage-inputs">
                {Object.keys(selectedAppliances).map(appliance => (
                  <div key={appliance} className="usage-input-item">
                    <label htmlFor={`usage-${appliance}`}>{appliance}</label>
                    <input
                      id={`usage-${appliance}`}
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      value={selectedAppliances[appliance].usage}
                      onChange={(e) => handleUsageChange(appliance, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
            <span className="btn-text">Predict My Bill</span>
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {prediction && (
          <div className="prediction-result">
            <h2>Prediction Results</h2>
            <div className="result-cards">
              <div className="result-card">
                <h3>This Month</h3>
                <p className="kwh">{prediction.this_month.predicted_kwh} <span>kWh</span></p>
                <p className="bill">LKR {prediction.this_month.predicted_bill_lkr}</p>
              </div>
              <div className="result-card">
                <h3>Next Month</h3>
                <p className="kwh">{prediction.next_month.predicted_kwh} <span>kWh</span></p>
                <p className="bill">LKR {prediction.next_month.predicted_bill_lkr}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}