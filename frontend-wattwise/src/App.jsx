import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your page components
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import UsageQuestionnaire from '../pages/user/dashboard/UsageQuestionnaire.jsx';
import ApplianceEntry from '../pages/user/dashboard/ApplianceEntry.jsx';
import BudgetSetup from '../pages/user/dashboard/BudgetSetter.jsx';

// Placeholder components for dashboards
const UserDashboard = () => <div>User Dashboard</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/usage-questionnaire" element={<UsageQuestionnaire />} />
        <Route path="/appliance-entry" element={<ApplianceEntry />} />
        <Route path="/budget-setup" element={<BudgetSetup />} />
        
        {/* Later, you will protect these routes */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* Redirect any other path to the login page */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

