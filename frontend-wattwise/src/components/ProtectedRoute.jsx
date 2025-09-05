import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/authcontext.jsx";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in or role mismatch → logout & redirect
    if (!user || (requiredRole && user.role !== requiredRole)) {
      logout();
      navigate("/login");
    }
  }, [user, requiredRole, logout, navigate]);

  // While redirecting, render nothing
  if (!user || (requiredRole && user.role !== requiredRole)) return null;

  return children;
}
