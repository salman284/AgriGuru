import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';
import logo from './logo.png'; 
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher'; 
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';

const Navbar = () => {
  const { t } = useTranslation('common');
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            <img src={logo} alt="AgriGuru Logo" className="logo-image" />
            <h2>AgriGuru</h2>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'mobile-active' : ''}`}>
          <li className="navbar-item">
            <Link 
              to="/" 
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navbar.home')}
            </Link>
          </li>
          
          {user && (
            <li className="navbar-item">
              <Link 
                to="/dashboard" 
                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('navbar.dashboard')}
              </Link>
            </li>
          )}
          
          <li className="navbar-item">
            <Link 
              to="/government-schemes" 
              className={`navbar-link ${isActive('/government-schemes') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navbar.government')}
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/about" 
              className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navbar.about')}
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/contacts" 
              className={`navbar-link ${isActive('/contacts') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {t('navbar.contact_ado')}
            </Link>
          </li>
          <li className="navbar-item">
            <Link 
              to="/marketplace" 
              className={`navbar-link ${isActive('/marketplace') ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              🛒 {t('navbar.marketplace')}
            </Link>
          </li>
        </ul>

        <div className="navbar-auth">
          <LanguageSwitcher />
          
          {/* Authentication Section */}
          {!loading && (
            <>
              {user ? (
                /* Show Profile Dropdown if user is logged in */
                <div className="auth-section authenticated">
                  <ProfileDropdown />
                </div>
              ) : (
                /* Show Login/Signup buttons if user is not logged in */
                <div className="auth-section unauthenticated">
                  <Link to="/login" className="login-btn">{t('navbar.login')}</Link>
                  <Link to="/signup" className="signup-btn">{t('navbar.signup')}</Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
