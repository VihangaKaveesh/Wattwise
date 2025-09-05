import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../../src/context/authcontext.jsx";
import { authService } from "../../services/authService";
import "./style/LoginPage.css";

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // authService.login returns { token, role, id }
      const userData = await authService.login(email, password);
      if (!userData || !userData.token) throw new Error("Login failed");

      // Only pass the token string to login
      await login(userData.token);

      // Navigate based on role
      if (userData.role === "admin") navigate("/admin/dashboard");
      else if (userData.role === "user") navigate("/dashboard");
      else setError("User role not recognized");

    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome</h1>
          <p>Log in to your energy dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <span className="icon"><EmailIcon /></span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
            />
          </div>

          <div className="input-group">
            <span className="icon"><LockIcon /></span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn">
            <span className="btn-text">Sign In</span>
          </button>
        </form>

        <div className="login-footer">
          <p>No account? <Link to="/register" className="create-account-link">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
