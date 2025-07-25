import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import './loginbg.jpg'

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for sessions
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Welcome back, ${result.user.full_name}!`);
        // Store user info in localStorage if needed
        localStorage.setItem('user', JSON.stringify(result.user));
        // Redirect to dashboard or home
        navigate('/dashboard');
      } else {
        alert(`❌ Login failed: ${result.message}`);
      }
    } catch (error) {
      alert('❌ Error connecting to the server');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <h5>Not Registered Yet?</h5>
        <Link to="/signup" className="signup-btn">Sign Up</Link>
        <p className="forgot-password">Forgot Password?</p>
      </form>
    </div>
  );
};

export default Login;