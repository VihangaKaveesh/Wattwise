import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Page components
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

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Routes (protected) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usage-questionnaire" 
          element={
            <ProtectedRoute requiredRole="user">
              <UsageQuestionnaire />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/appliancec-entry" 
          element={
            <ProtectedRoute requiredRole="user">
              <ApplianceEntry />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/budget-setup" 
          element={
            <ProtectedRoute requiredRole="user">
              <BudgetSetup />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserProfile />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes (protected) */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ReportGenerator />
            </ProtectedRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
