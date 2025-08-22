import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components.css';

const Header = () => {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/">WattWise</Link>
      </div>
      <input type="checkbox" id="menu-toggle" />
      <label htmlFor="menu-toggle" className="menu-icon">&#9776;</label>
      <ul className="navbar-links">
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
        <li><Link to="/terms">Terms & Conditions</Link></li>
        <li><Link to="/login" className="login-btn">Login</Link></li>
      </ul>
    </header>
  );
};

export default Header;
