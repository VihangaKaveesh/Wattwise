import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../src/context/authcontext.jsx';
import './UserProfile.css';

export default function UserProfile() {
  const { user } = useContext(AuthContext); // Get JWT + userId from context
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = user?.userId;
  const token = user?.token;

  // Fetch user profile + appliances
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!userId || !token) return;

        // 1️⃣ Fetch user info
        const userRes = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("User fetched:", userRes.data);
        setUserData(userRes.data);

        // 2️⃣ Fetch user's appliances
        const applianceRes = await axios.get(`http://localhost:5000/api/user-appliances/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Appliances fetched:", applianceRes.data);
        setAppliances(applianceRes.data.appliances || []);

      } catch (err) {
        console.error('Error fetching profile:', err.response?.data || err.message);
        setError('Failed to fetch user profile or appliances.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, token]);

  const handleDeleteAppliances = async () => {
    if (!window.confirm('Are you sure you want to delete all appliances?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/user-appliances/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppliances([]); // clear locally
    } catch (err) {
      console.error('Error deleting appliances:', err);
      setError('Failed to delete appliances.');
    }
  };

  const handleAddAppliances = () => {
    navigate('/appliancec-entry', { state: { userId, token } });
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {error && <div className="error-message">{error}</div>}

        {userData && (
          <div className="user-info">
            <h2>{userData.name}</h2>
            <p>{userData.email}</p>
          </div>
        )}

        <div className="appliances-section">
          <div className="section-header">
            <h3>Your Appliances</h3>
            {appliances.length > 0 && (
              <button className="delete-btn" onClick={handleDeleteAppliances}>Delete All</button>
            )}
          </div>

          <div className="appliances-grid">
            {appliances.length > 0 ? (
              appliances.map((app, idx) => (
                <div key={idx} className="appliance-card">
                  <span>{app.name || "Unnamed Appliance"}</span>
                  {app.power && <small>{app.power} W</small>}
                  {app.location && <small>{app.location}</small>}
                </div>
              ))
            ) : (
              <div className="no-appliances">
                <p>No appliances added yet.</p>
                <button className="add-btn" onClick={handleAddAppliances}>+ Add Appliance</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
