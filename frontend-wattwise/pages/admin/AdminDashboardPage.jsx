import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../src/context/authcontext.jsx';
import './style/AdminDahsboardPage.css';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const token = user?.token;

  const [totalForecasts, setTotalForecasts] = useState({ thisMonth: 0, nextMonth: 0 });
  const [totalUsage, setTotalUsage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchAdminData = async () => {
      try {
        // Fetch forecasts
        const forecastRes = await axios.get('http://localhost:5000/api/forecasts', {
          headers: { Authorization: `Bearer ${token}` }
        });

        let thisMonthTotal = 0;
        let nextMonthTotal = 0;
        let usageTotal = 0;

        forecastRes.data.forEach(f => {
          thisMonthTotal += f.predictions?.this_month?.predicted_bill_lkr || 0;
          nextMonthTotal += f.predictions?.next_month?.predicted_bill_lkr || 0;
          usageTotal += f.predictions?.this_month?.predicted_kwh || 0;
        });

        setTotalForecasts({ thisMonth: thisMonthTotal, nextMonth: nextMonthTotal });
        setTotalUsage(usageTotal);

        // Fetch users with role 'user'
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

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-cards">
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

        <div className="admin-card">
          <h2>Total Usage & Users</h2>
          <p><strong>Total Usage:</strong> {totalUsage.toLocaleString()} kWh</p>
          <p><strong>Total Users:</strong> {totalUsers}</p>
        </div>
      </div>
    </div>
  );
}
