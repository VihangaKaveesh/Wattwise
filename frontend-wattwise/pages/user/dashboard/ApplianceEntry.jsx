import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './styles/ApplianceEntry.css';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../../src/context/authcontext.jsx'; // <-- Import AuthContext

const AVAILABLE_APPLIANCES = [
  "Ceiling Fan", "Pedestal Fan", "Refrigerator (200–300L)",
  "Inverter AC (9000–12000 BTU)", "Non-inverter AC (12000 BTU)",
  "LED TV (40–50 in)", "Laptop", "Desktop PC", "Washing Machine (Front-load)",
  "Rice Cooker", "Electric Kettle", "Microwave Oven", "Iron", "Water Pump",
  "Incandescent Bulb", "LED Bulb", "Water Heater (Instant)", "Blender"
];

const CITY_OPTIONS = [
  "Colombo", "Mount Lavinia", "Kesbewa", "Maharagama", "Moratuwa", "Ratnapura",
  "Negombo", "Kandy", "Sri Jayewardenepura Kotte", "Kalmunai", "Trincomalee",
  "Galle", "Jaffna", "Athurugiriya", "Weligama", "Matara", "Kolonnawa",
  "Gampaha", "Puttalam", "Badulla", "Kalutara", "Bentota", "Mannar", "Kurunegala"
];

export default function ApplianceEntry() {
  const navigate = useNavigate();
  const locationObj = useLocation();
  const { state } = locationObj;

  // <-- Get userId and token from AuthContext first
  const { user } = useContext(AuthContext);
  const userId = user?.userId || state?.userId;
  const token = user?.token || state?.token;

  const [location, setLocation] = useState('');
  const [selectedAppliances, setSelectedAppliances] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppliances = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user-appliances/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocation(res.data.location);
        const appliances = {};
        res.data.appliances.forEach(a => {
          appliances[a.name] = true;
        });
        setSelectedAppliances(appliances);
      } catch (err) {
        console.log('No existing appliances found or error:', err.response?.data || err.message);
      }
    };
    if (userId && token) fetchAppliances();
  }, [userId, token]);

  const handleApplianceChange = (appliance) => {
    setSelectedAppliances(prev => {
      const newSelection = { ...prev };
      if (newSelection[appliance]) delete newSelection[appliance];
      else newSelection[appliance] = true;
      return newSelection;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      location,
      appliances: Object.keys(selectedAppliances).map(name => ({ name }))
    };

    try {
      await axios.post(`http://localhost:5000/api/user-appliances/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ Show success alert
      alert('Appliances saved successfully!');

      // ✅ Redirect back to profile with userId & token
      navigate('/profile', { state: { userId, token } });
    } catch (err) {
      setError('Failed to save appliances.');
      console.error(err);
    }
  };

  return (
    <div className="appliance-entry-page">
      <div className="appliance-entry-container">
        <h1>My Appliances</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <label htmlFor="location">Location:</label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="">Select your city</option>
              {CITY_OPTIONS.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label>Select Appliances:</label>
            <div className="appliances-grid">
              {AVAILABLE_APPLIANCES.map(a => (
                <div key={a} className="appliance-item">
                  <input
                    type="checkbox"
                    id={a}
                    checked={!!selectedAppliances[a]}
                    onChange={() => handleApplianceChange(a)}
                  />
                  <label htmlFor={a}>{a}</label>
                </div>
              ))}
            </div>
          </div>

          <button type="submit">Save Appliances</button>
        </form>

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
