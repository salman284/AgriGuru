import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <h2>AgriGuru</h2>
          </Link>
        </div>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li className="navbar-item">
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          </li>
          <li className="navbar-item">
            <a href="#about" className="navbar-link">About</a>
          </li>
          <li className="navbar-item">
            <a href="#contact" className="navbar-link">Contact</a>
          </li>
        </ul>
        <div className="navbar-auth">
          <button className="login-btn" a href="/login">Login</button>
          <button className="signup-btn" a href="/signup">Sign Up</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
