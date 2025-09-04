import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import AuthContext from '../../../src/context/authcontext.jsx';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './styles/Dashboard.css';

export default function UserDashboard() {
  const locationObj = useLocation();
  const { state } = locationObj;

  const { user } = useContext(AuthContext); // <-- get JWT and userId from context
  const userId = user?.userId || state?.userId;
  const token = user?.token || state?.token;

  const [appliances, setAppliances] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Get user appliances
        const appliancesRes = await axios.get(`http://localhost:5000/api/user-appliances/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppliances(appliancesRes.data.appliances || []);

        // Get user forecasts
        const forecastRes = await axios.get(`http://localhost:5000/api/forecasts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForecasts(forecastRes.data || []);
        if (forecastRes.data.length > 0) {
          const sorted = [...forecastRes.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLatestPrediction(sorted[0]);
        }

        // Get user recommendations
        const recRes = await axios.get(`http://localhost:5000/api/user-recommendations/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecommendations(recRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (userId && token) fetchDashboard();
  }, [userId, token]);

  // Prepare chart data
  const chartData = forecasts.map(f => ({
    month: `${f.month}/${f.year}`,
    kWh: f.predictions?.this_month?.predicted_kwh || 0,
    bill: f.predictions?.this_month?.predicted_bill_lkr || 0
  }));

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page container">  
      {/* Chart */}
      <div className="chart">
        <h2>Usage & Bill Over Time</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" dataKey="kWh" stroke="#8884d8" />
              <Line yAxisId="right" dataKey="bill" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No forecasts available.</p>
        )}
      </div>

      {/* Latest Prediction */}
      <div className="prediction">
        <h2>Latest Prediction</h2>
        {latestPrediction ? (
          <div className="prediction-details">
            <p><strong>This Month:</strong> {latestPrediction.predictions?.this_month?.predicted_kwh || 0} kWh | LKR {latestPrediction.predictions?.this_month?.predicted_bill_lkr || 0}</p>
            <p><strong>Next Month:</strong> {latestPrediction.predictions?.next_month?.predicted_kwh || 0} kWh | LKR {latestPrediction.predictions?.next_month?.predicted_bill_lkr || 0}</p>
          </div>
        ) : (
          <p>No prediction available.</p>
        )}
      </div>

      {/* Appliances */}
      <div className="appliances">
        <h2>Your Appliances</h2>
        {appliances.length > 0 ? (
          <div className="appliance-cards">
            {appliances.map((a, idx) => (
              <div key={idx} className="appliance-card">
                <p>{a.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No appliances added yet.</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="recommendation">
        <h2>Your Latest Recommendations</h2>
        {recommendations?.appliances && recommendations.appliances.length > 0 ? (
          <div className="recommendation-cards">
            {recommendations.appliances.map((item, idx) => (
              <div key={idx} className="recommendation-card">
                <p>{item.name}</p>
                <h3>{item.recommended_hours_per_day || 'N/A'} hrs/day</h3>
              </div>
            ))}
          </div>
        ) : (
          <p>No recommendations available.</p>
        )}
      </div>
    </div>
  );
}
