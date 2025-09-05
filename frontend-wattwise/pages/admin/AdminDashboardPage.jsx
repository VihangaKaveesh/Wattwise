import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../src/context/authcontext.jsx';
import './style/AdminDahsboardPage.css';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const token = user?.token;

  const [forecasts, setForecasts] = useState([]);
  const [filteredForecasts, setFilteredForecasts] = useState([]);
  const [totalForecasts, setTotalForecasts] = useState({ thisMonth: 0, nextMonth: 0 });
  const [totalUsage, setTotalUsage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!token) return;

    const fetchAdminData = async () => {
      try {
        // Fetch forecasts
        const forecastRes = await axios.get('http://localhost:5000/api/forecasts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForecasts(forecastRes.data);
        setFilteredForecasts(forecastRes.data);

        // Fetch users
        const userRes = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const normalUsers = userRes.data.filter(u => u.role === 'user');
        setTotalUsers(normalUsers.length);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [token]);

  // Filter forecasts by selected date range
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredForecasts(forecasts);
      return;
    }

    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date();

    const filtered = forecasts.filter(f => {
      const forecastDate = new Date(f.createdAt);
      return forecastDate >= start && forecastDate <= end;
    });

    setFilteredForecasts(filtered);
  }, [startDate, endDate, forecasts]);

  // Calculate totals
  useEffect(() => {
    let thisMonthTotal = 0;
    let nextMonthTotal = 0;
    let usageTotal = 0;

    filteredForecasts.forEach(f => {
      thisMonthTotal += f.predictions?.this_month?.predicted_bill_lkr || 0;
      nextMonthTotal += f.predictions?.next_month?.predicted_bill_lkr || 0;
      usageTotal += f.predictions?.this_month?.predicted_kwh || 0;
    });

    setTotalForecasts({ thisMonth: thisMonthTotal, nextMonth: nextMonthTotal });
    setTotalUsage(usageTotal);
  }, [filteredForecasts]);

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {/* Date Range Filter */}
      <div className="filter-container">
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>
        <button onClick={() => { setStartDate(''); setEndDate(''); }}>Reset Filter</button>
      </div>

      <div className="admin-cards">
        {/* Forecast Cards */}
        <div className="admin-card">
          <h2>Total Forecasted Bills</h2>
          <div className="forecast-values">
            <div className="forecast-card">
              <h3>This Month</h3>
              <p>LKR {totalForecasts.thisMonth.toLocaleString()}</p>
            </div>
            <div className="forecast-card">
              <h3>Next Month</h3>
              <p>LKR {totalForecasts.nextMonth.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Usage & Users Card */}
        <div className="admin-card">
          <h2>Total Usage & Users</h2>
          <p><strong>Total Usage:</strong> {totalUsage.toLocaleString()} kWh</p>
          <p><strong>Total Users:</strong> {totalUsers}</p>
        </div>
      </div>

      {/* Optional: List of filtered forecasts */}
      <div className="forecast-list">
        <h2>Filtered Forecasts</h2>
        {filteredForecasts.length === 0 ? (
          <p>No forecasts for this period.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Date</th>
                <th>This Month (LKR)</th>
                <th>Next Month (LKR)</th>
                <th>Usage (kWh)</th>
              </tr>
            </thead>
            <tbody>
              {filteredForecasts.map(f => (
                <tr key={f._id}>
                  <td>{f.user.name}</td>
                  <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td>{f.predictions?.this_month?.predicted_bill_lkr.toLocaleString()}</td>
                  <td>{f.predictions?.next_month?.predicted_bill_lkr.toLocaleString()}</td>
                  <td>{f.predictions?.this_month?.predicted_kwh.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
