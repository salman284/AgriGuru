import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './sign.css';

const SignUp = () => {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const [userType, setUserType] = useState('customer'); // 'farmer' or 'customer'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone,
        userType
      );
      
      if (result.success) {
        const successMsg = userType === 'farmer' ? '✅ Welcome, Farmer! Your account has been created.' : `✅ ${result.message}`;
        alert(successMsg);
        // User will be automatically logged in and redirected
      } else {
        alert(`❌ Registration failed: ${result.message}`);
      }
    } catch (error) {
      alert('❌ Error connecting to the server');
      console.error(error);
    }
  };

  return (

    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="subtitle">Join AgriGuru and get expert farming assistance</p>
        
        {/* User Type Selection */}
        <div className="user-type-selection">
          <button
            type="button"
            className={`user-type-btn ${userType === 'customer' ? 'active' : ''}`}
            onClick={() => setUserType('customer')}
          >
            <span className="icon">🛒</span>
            <span>Customer</span>
            <small>Buy fresh products</small>
          </button>
          <button
            type="button"
            className={`user-type-btn ${userType === 'farmer' ? 'active' : ''}`}
            onClick={() => setUserType('farmer')}
          >
            <span className="icon">🌾</span>
            <span>Farmer</span>
            <small>Sell your produce</small>
          </button>
        </div>
        
        <div className="input-group">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="input-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
          />
        </div>

        <div className="input-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Enter your city/village"
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Create a password"
          />
        </div>

        <div className="input-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
          />
        </div>

        <button type="submit" className="signup-btn">Create Account</button>
        
        <div className="login-link">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;