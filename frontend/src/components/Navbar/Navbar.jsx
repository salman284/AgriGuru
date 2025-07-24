import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';
import logo from './logo.png'; 
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'; 

const Navbar = () => {
  const { t } = useTranslation('common');
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <img src={logo} alt="AgriGuru Logo" className="logo-image" />
            <h2>AgriGuru</h2>
          </Link>
        </div>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">{t('navbar.home')}</Link>
          </li>
          <li className="navbar-item">
            <Link to="/dashboard" className="navbar-link">{t('navbar.dashboard')}</Link>
          </li>
          <li className="navbar-item">
            <Link to="/government-schemes" className="navbar-link">{t('navbar.government')}</Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link">{t('navbar.about')}</Link>
          </li>
          <li className="navbar-item">
            <Link to="/contacts" className="navbar-link">{t('navbar.contact_ado')}</Link>
          </li>
          <li className="navbar-item">
            <Link to="/marketplace" className="navbar-link">🛒 {t('navbar.marketplace')}</Link>
          </li>
        </ul>
        <div className="navbar-auth">
          <LanguageSwitcher />
          <Link to="/login" className="login-btn">{t('navbar.login')}</Link>
          <Link to="/signup" className="signup-btn">{t('navbar.signup')}</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
