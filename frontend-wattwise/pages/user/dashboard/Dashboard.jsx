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

  const { user } = useContext(AuthContext); 
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
        // 1️⃣ Get user appliances
        const appliancesRes = await axios.get(`http://localhost:5000/api/user-appliances/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppliances(appliancesRes.data.appliances || []);

        // 2️⃣ Get user forecasts
        const forecastRes = await axios.get(`http://localhost:5000/api/forecasts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sortedForecasts = [...forecastRes.data].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setForecasts(sortedForecasts);

        if (sortedForecasts.length > 0) {
          setLatestPrediction(sortedForecasts[sortedForecasts.length - 1]);
        }

        // 3️⃣ Get user recommendations
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

  // Chart data for all forecasts over time
  const chartData = forecasts.map(f => ({
    month: `${f.month}/${f.year}`,
    kWh: f.predictions?.this_month?.predicted_kwh || 0,
    bill: f.predictions?.this_month?.predicted_bill_lkr || 0
  }));

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page">

      {/* Usage & Bill Chart */}
      <div className="chart-section dashboard-card">
        <h2>Usage & Bill Over Time</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'LKR', angle: -90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" dataKey="kWh" stroke="#8884d8" activeDot={{ r: 6 }} />
              <Line yAxisId="right" dataKey="bill" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No forecasts available.</p>
        )}
      </div>

      {/* Latest Prediction */}
<div className="predictions-section dashboard-card">
  <h2>Latest Prediction</h2>
  {latestPrediction ? (
    <div className="prediction-cards">
      <div className="prediction-card">
        <h3>This Month</h3>
        <p className="kwh">{latestPrediction.predictions?.this_month?.predicted_kwh || 0} kWh</p>
        <p className="bill">LKR {latestPrediction.predictions?.this_month?.predicted_bill_lkr || 0}</p>
      </div>
      <div className="prediction-card">
        <h3>Next Month</h3>
        <p className="kwh">{latestPrediction.predictions?.next_month?.predicted_kwh || 0} kWh</p>
        <p className="bill">LKR {latestPrediction.predictions?.next_month?.predicted_bill_lkr || 0}</p>
      </div>
    </div>
  ) : (
    <p>No prediction available.</p>
  )}
</div>


      {/* Appliances */}
      <div className="appliances-section dashboard-card">
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
      <div className="recommendations-section dashboard-card">
        <h2>Your Latest Recommendations</h2>
        {recommendations?.recommended_hours_per_day ? (
          <div className="recommendation-cards">
            {Object.entries(recommendations.recommended_hours_per_day).map(([appliance, hours], idx) => (
              <div key={idx} className="recommendation-card">
                <p>{appliance}</p>
                <h3>{hours} hrs/day</h3>
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
