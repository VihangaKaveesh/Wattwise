import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../../src/context/authcontext.jsx';
import './styles/BudgetSetter.css';

export default function BudgetSetup() {
  const { user } = useContext(AuthContext); // get userId and token from context

  const [appliances, setAppliances] = useState([]);
  const [people, setPeople] = useState(1);
  const [budget, setBudget] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userId = user?.userId;
  const token = user?.token;

  // Fetch user-specific appliances on mount
  useEffect(() => {
    const fetchAppliances = async () => {
      try {
        if (!userId || !token) return;

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
      // 1️⃣ Get recommendations from Python service
      const res = await axios.post('http://localhost:5001/recommend-budget', {
        budget_lkr: parseFloat(budget),
        people,
        month,
        appliances: appliances.map(a => a.name),
      });

      const recommendedHours = res.data.recommended_hours_per_day;
      setRecommendations(recommendedHours);

      // 2️⃣ Send recommendations to Node.js backend
      await axios.post('http://localhost:5000/api/user-recommendations', {
        user: userId,
        recommended_hours_per_day: recommendedHours
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } catch (err) {
      console.error('Error fetching recommendations or saving:', err);
      setError('Failed to fetch or save recommendations.');
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
