import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import './Login.css';
import './loginbg.jpg'

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        alert(`✅ Welcome back!`);
        navigate('/dashboard'); // Redirect to dashboard after successful login
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (result) => {
    alert(`✅ Welcome via Google!`);
    navigate('/dashboard');
  };

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="login-divider">
          <span>OR</span>
        </div>
        
        <GoogleLoginButton 
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
        
        <Link to="/otp-login" className="otp-login-btn">
          🔐 Login with OTP
        </Link>
        
        <h5>Not Registered Yet?</h5>
        <Link to="/signup" className="signup-btn">Sign Up</Link>
        <p className="forgot-password">Forgot Password?</p>
      </form>
    </div>
  );
};

export default Login;