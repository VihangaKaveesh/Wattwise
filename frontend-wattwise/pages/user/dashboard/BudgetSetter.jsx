import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './styles/BudgetSetter.css';

export default function BudgetSetup() {
  const locationObj = useLocation();
  const { userId, token } = locationObj.state || {};

  const [appliances, setAppliances] = useState([]);
  const [people, setPeople] = useState(1);
  const [budget, setBudget] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user-specific appliances on mount
  useEffect(() => {
    const fetchAppliances = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user-appliances/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppliances(res.data.appliances || []);
      } catch (err) {
        console.error('Error fetching appliances:', err);
        setError('Failed to fetch your appliances.');
      }
    };
    fetchAppliances();
  }, [userId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!budget || appliances.length === 0) return;

    setLoading(true);
    setRecommendations(null);
    setError('');

    const month = new Date().getMonth() + 1; // current month

    try {
      const res = await axios.post('http://localhost:5001/recommend-budget', {
        budget_lkr: parseFloat(budget),
        people,
        month,
        appliances: appliances.map(a => a.name),
      });
      setRecommendations(res.data.recommended_hours_per_day);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to fetch budget recommendations.');
    }

    setLoading(false);
  };

  return (
    <div className="appliance-entry-page">
      <div className="appliance-entry-container">
        <h1>Budget Setup</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label htmlFor="people">Number of People in Household:</label>
            <input
              id="people"
              type="number"
              min="1"
              value={people}
              onChange={(e) => setPeople(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="form-section">
            <label htmlFor="budget">Monthly Budget (LKR):</label>
            <input
              id="budget"
              type="number"
              min="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />
          </div>

          <div className="form-section">
            <label>Your Appliances:</label>
            <div className="appliances-grid">
              {appliances.map(a => (
                <div key={a.name} className="appliance-item">
                  <span>{a.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Get Recommendations'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {recommendations && (
          <div className="recommendation-results">
            <h3>Recommended Daily Hours per Appliance</h3>
            <ul>
              {Object.entries(recommendations).map(([app, hours]) => (
                <li key={app}>
                  <strong>{app}</strong>: {hours} hours/day
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
