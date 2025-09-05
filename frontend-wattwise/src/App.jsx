import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your page components
import LoginPage from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import UsageQuestionnaire from '../pages/user/dashboard/UsageQuestionnaire.jsx';
import ApplianceEntry from '../pages/user/dashboard/ApplianceEntry.jsx';
import BudgetSetup from '../pages/user/dashboard/BudgetSetter.jsx';
import UserProfile from '../pages/user/profile/UserProfile.jsx';
import UserDashboard from '../pages/user/dashboard/Dashboard.jsx';
import Navbar from './components/Navbar.jsx';
import AdminDashboard from '../pages/admin/AdminDashboardPage.jsx';
import ReportGenerator from '../pages/admin/ReportGenerator.jsx';


// Placeholder components for dashboards
//const UserDashboard = () => <div>User Dashboard</div>;
//const AdminDashboard = () => <div>Admin Dashboard</div>;

function App() {
  return (
    
    <Router>
      <Navbar /> 
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/usage-questionnaire" element={<UsageQuestionnaire />} />
        <Route path="/appliancec-entry" element={<ApplianceEntry />} />
        <Route path="/budget-setup" element={<BudgetSetup />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/reports" element={<ReportGenerator/>} />

        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;

