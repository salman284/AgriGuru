import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import WhatsAppSettings from '../../components/WhatsAppSettings/WhatsAppSettings';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notifications');

  // Redirect if not logged in
  if (!user) {
    return (
      <div className="settings-container">
        <div className="not-logged-in">
          <h2>{t('settings.please_login')}</h2>
          <p>{t('settings.login_required')}</p>
          <button onClick={() => navigate('/login')} className="login-redirect-btn">
            {t('settings.go_to_login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="settings-avatar">
          ⚙️
        </div>
        <h1>{t('settings.title')}</h1>
        <p className="settings-subtitle">
          {t('settings.subtitle')}
        </p>
      </div>
      
      <div className="settings-main-card">
        <div className="settings-tabs">
          <button 
            className={activeTab === 'notifications' ? 'active' : ''} 
            onClick={() => setActiveTab('notifications')}
          >
            <span className="tab-icon">📱</span>
            {t('settings.notifications')}
          </button>
          <button 
            className={activeTab === 'preferences' ? 'active' : ''} 
            onClick={() => setActiveTab('preferences')}
          >
            <span className="tab-icon">🎛️</span>
            {t('settings.preferences')}
          </button>
          <button 
            className={activeTab === 'privacy' ? 'active' : ''} 
            onClick={() => setActiveTab('privacy')}
          >
            <span className="tab-icon">🔐</span>
            {t('settings.privacy')}
          </button>
        </div>
        
        <div className="settings-content">
          {activeTab === 'notifications' && (
            <div className="settings-tab-content">
              <div className="settings-section">
                <h2>{t('settings.whatsapp_alerts')}</h2>
                <p className="section-description">
                  {t('settings.whatsapp_description')}
                </p>
                <WhatsAppSettings />
              </div>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div className="settings-tab-content">
              <div className="settings-section">
                <h2>{t('settings.app_preferences')}</h2>
                <p className="section-description">
                  {t('settings.preferences_description')}
                </p>
                
                <div className="preference-item">
                  <div className="preference-header">
                    <h3>{t('settings.language')}</h3>
                    <p>{t('settings.language_description')}</p>
                  </div>
                  <div className="preference-control">
                    <select className="preference-select">
                      <option value="en">English</option>
                      <option value="hi">हिंदी</option>
                      <option value="ta">தமிழ்</option>
                      <option value="te">తెలుగు</option>
                      <option value="pa">ਪੰਜਾਬੀ</option>
                      <option value="bn">বাংলা</option>
                      <option value="mr">मराठी</option>
                    </select>
                  </div>
                </div>

                <div className="preference-item">
                  <div className="preference-header">
                    <h3>{t('settings.theme')}</h3>
                    <p>{t('settings.theme_description')}</p>
                  </div>
                  <div className="preference-control">
                    <select className="preference-select">
                      <option value="light">{t('settings.light_theme')}</option>
                      <option value="dark">{t('settings.dark_theme')}</option>
                      <option value="auto">{t('settings.auto_theme')}</option>
                    </select>
                  </div>
                </div>

                <div className="preference-item">
                  <div className="preference-header">
                    <h3>{t('settings.units')}</h3>
                    <p>{t('settings.units_description')}</p>
                  </div>
                  <div className="preference-control">
                    <select className="preference-select">
                      <option value="metric">{t('settings.metric')}</option>
                      <option value="imperial">{t('settings.imperial')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="settings-tab-content">
              <div className="settings-section">
                <h2>{t('settings.privacy_security')}</h2>
                <p className="section-description">
                  {t('settings.privacy_description')}
                </p>
                
                <div className="privacy-item">
                  <div className="privacy-header">
                    <h3>{t('settings.data_sharing')}</h3>
                    <p>{t('settings.data_sharing_description')}</p>
                  </div>
                  <div className="privacy-control">
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="privacy-item">
                  <div className="privacy-header">
                    <h3>{t('settings.location_services')}</h3>
                    <p>{t('settings.location_description')}</p>
                  </div>
                  <div className="privacy-control">
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="privacy-item">
                  <div className="privacy-header">
                    <h3>{t('settings.analytics')}</h3>
                    <p>{t('settings.analytics_description')}</p>
                  </div>
                  <div className="privacy-control">
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="danger-zone">
                  <h3>{t('settings.danger_zone')}</h3>
                  <p>{t('settings.danger_description')}</p>
                  <button className="danger-btn">
                    {t('settings.delete_account')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;