import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Login.css';
import './loginbg.jpg'

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add authentication logic here
    alert(`Username: ${username}\nPassword: ${password}`);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="input-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
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
        <button type="submit">Login</button>
        <h5>Not Registered Yet?</h5>
        <button className="signup-btn" onClick={() => alert('Redirect to Signup')}>Sign Up</button>
        <p className="forgot-password">Forgot Password?</p>
      </form>
    </div>
  );
};

export default Login;