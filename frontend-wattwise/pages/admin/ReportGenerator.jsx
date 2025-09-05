import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import AuthContext from "../../src/context/authcontext.jsx";
import "./style/ReportGenerator.css";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#A569BD", "#E74C3C", "#3498DB", "#F39C12",
  "#2ECC71", "#1ABC9C", "#9B59B6", "#34495E"
];

const CITY_OPTIONS = [
  "Colombo", "Mount Lavinia", "Kesbewa", "Maharagama", "Moratuwa", "Ratnapura",
  "Negombo", "Kandy", "Sri Jayewardenepura Kotte", "Kalmunai", "Trincomalee",
  "Galle", "Jaffna", "Athurugiriya", "Weligama", "Matara", "Kolonnawa",
  "Gampaha", "Puttalam", "Badulla", "Kalutara", "Bentota", "Mannar", "Kurunegala"
];

export default function ReportGenerator() {
  const { user } = useContext(AuthContext);
  const [appliances, setAppliances] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [regionStats, setRegionStats] = useState({ users: 0, usage: 0 });
  const [monthlyUsageData, setMonthlyUsageData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!user?.token) return;


    const fetchData = async () => {
      try {
        const applianceRes = await axios.get("http://localhost:5000/api/user-appliances/user-appliances", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const forecastRes = await axios.get("http://localhost:5000/api/forecasts", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setAppliances(applianceRes.data);
        setForecasts(forecastRes.data);

        // ----- Pie Chart: Regional Usage -----
        const regionMap = {};
        applianceRes.data.forEach((appl) => {
          const region = CITY_OPTIONS.includes(appl.location) ? appl.location : "Other";
          if (!regionMap[region]) regionMap[region] = { users: new Set(), usage: 0 };
        });

        forecastRes.data.forEach((fc) => {
          const userId = fc.user._id;
          const userAppliance = applianceRes.data.find((a) => a.userId === userId);
          const region = userAppliance && CITY_OPTIONS.includes(userAppliance.location)
            ? userAppliance.location
            : "Other";

          if (!regionMap[region]) regionMap[region] = { users: new Set(), usage: 0 };
          regionMap[region].users.add(userId);
          regionMap[region].usage += fc.predictions?.this_month?.predicted_kwh || 0;
        });

        const chartData = Object.keys(regionMap).map((region) => ({
          name: region,
          value: parseFloat(regionMap[region].usage.toFixed(2)),
        }));

        setRegionData(chartData);

        // ----- Line Chart: Monthly Total Usage -----
        const monthlyMap = {};
        forecastRes.data.forEach((fc) => {
          ["this_month", "next_month"].forEach((key) => {
            if (fc.predictions?.[key]?.predicted_kwh !== undefined) {
              const month = fc.predictions[key].month || key; // fallback
              monthlyMap[month] = (monthlyMap[month] || 0) + fc.predictions[key].predicted_kwh;
            }
          });
        });

        const monthlyChartData = Object.keys(monthlyMap)
          .sort() // ensure chronological order if keys are like 'Jan', 'Feb'
          .map((month) => ({
            month,
            usage: parseFloat(monthlyMap[month].toFixed(2)),
          }));

        setMonthlyUsageData(monthlyChartData);

      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!selectedRegion) return;

    const usersInRegion = appliances
      .filter((a) => a.location === selectedRegion)
      .map((a) => a.userId);

    const usageInRegion = forecasts
      .filter((f) => usersInRegion.includes(f.user._id))
      .reduce((acc, f) => acc + (f.predictions?.this_month?.predicted_kwh || 0), 0);

    setRegionStats({
      users: new Set(usersInRegion).size,
      usage: parseFloat(usageInRegion.toFixed(2)),
    });
  }, [selectedRegion, appliances, forecasts]);


   if (loading) return <div className="loading">Loading report...</div>;

  return (
    <div className="report-generator">
      <h1>Energy Usage Reports</h1>

      <div className="charts-row">
        {/* Pie Chart */}
        <div className="chart-container">
          <h2>Regional Usage</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={regionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label={(entry) => `${entry.name}: ${entry.value.toFixed(2)} kWh`}
              >
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(2)} kWh`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="chart-container">
          <h2>Monthly Total Usage</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyUsageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(2)} kWh`} />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Region Filter */}
      <div className="region-filter">
        <label htmlFor="region">Select City:</label>
        <select
          id="region"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="">-- Choose City --</option>
          {CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {selectedRegion && (
        <div className="region-stats">
          <h2>{selectedRegion} Stats</h2>
          <p><strong>Total Users:</strong> {regionStats.users}</p>
          <p><strong>Total Usage:</strong> {regionStats.usage.toLocaleString()} kWh</p>
        </div>
      )}
    </div>
  );
}
