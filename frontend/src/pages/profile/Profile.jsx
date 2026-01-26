import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile, isAuthenticated, checkAuthStatus } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    farm_location: '',
    farm_size: '',
    crops: [],
    farm_health: {
      soil_ph: '',
      soil_health_score: '',
      last_pest_inspection: '',
      pest_issues: [],
      irrigation_system: '',
      fertilizer_usage: '',
      disease_history: [],
      overall_health_status: 'good'
    }
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Debug console log
  console.log('Profile component render:', { user, isAuthenticated });
  
  // Check auth status when component mounts
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        farm_location: user.profile?.farm_location || '',
        farm_size: user.profile?.farm_size || '',
        crops: user.profile?.crops || [],
        farm_health: {
          soil_ph: user.profile?.farm_health?.soil_ph || '',
          soil_health_score: user.profile?.farm_health?.soil_health_score || '',
          last_pest_inspection: user.profile?.farm_health?.last_pest_inspection || '',
          pest_issues: user.profile?.farm_health?.pest_issues || [],
          irrigation_system: user.profile?.farm_health?.irrigation_system || '',
          fertilizer_usage: user.profile?.farm_health?.fertilizer_usage || '',
          disease_history: user.profile?.farm_health?.disease_history || [],
          overall_health_status: user.profile?.farm_health?.overall_health_status || 'good'
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCropChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, crops: [...formData.crops, value] });
    } else {
      setFormData({ ...formData, crops: formData.crops.filter(crop => crop !== value) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const profileData = {
        full_name: formData.full_name,
        phone: formData.phone,
        profile: {
          farm_location: formData.farm_location,
          farm_size: formData.farm_size,
          crops: formData.crops,
          farm_health: formData.farm_health
        }
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        setMessage(result.message || 'Profile updated successfully');
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in both ways for compatibility
  if (!user && !isAuthenticated) {
    return (
      <div className="profile-container">
        <div className="not-logged-in">
          <h2>{t('profile.notLoggedIn')}</h2>
          <p>{t('profile.pleaseLogin')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          👤
        </div>
        <h1>{t('profile.title')}</h1>
        <p className="profile-subtitle">
          {t('profile.welcomeMessage', { name: user?.full_name || user?.email?.split('@')[0] || 'User' })}
        </p>
      </div>
      
      <div className="profile-main-card">
        <div className="profile-tabs">
          <button 
            className={activeTab === 'basic' ? 'active' : ''} 
            onClick={() => setActiveTab('basic')}
          >
            {t('profile.basicInfo')}
          </button>
          <button 
            className={activeTab === 'farm' ? 'active' : ''} 
            onClick={() => setActiveTab('farm')}
          >
            {t('profile.farmDetails')}
          </button>
          <button 
            className={activeTab === 'health' ? 'active' : ''} 
            onClick={() => setActiveTab('health')}
          >
            {t('profile.farmHealth')}
          </button>
        </div>
        
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="profile-form">
            {activeTab === 'basic' && (
              <div className="profile-tab-content">
                <div className="form-group">
                  <label htmlFor="full_name">{t('profile.fullName')}</label>
                  <input 
                    type="text" 
                    id="full_name" 
                    name="full_name" 
                    value={formData.full_name} 
                    onChange={handleChange}
                    required
                    placeholder={t('profile.fullNamePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">{t('profile.phone')}</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder={t('profile.phonePlaceholder')}
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'farm' && (
              <div className="profile-tab-content">
                <div className="form-group">
                  <label htmlFor="farm_location">{t('profile.farmLocation')}</label>
                  <input 
                    type="text" 
                    id="farm_location" 
                    name="farm_location" 
                    value={formData.farm_location} 
                    onChange={handleChange}
                    placeholder={t('profile.farmLocationPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="farm_size">{t('profile.farmSize')}</label>
                  <input 
                    type="text" 
                    id="farm_size" 
                    name="farm_size" 
                    value={formData.farm_size} 
                    onChange={handleChange}
                    placeholder={t('profile.farmSizeHint')}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('profile.crops')}</label>
                  <div className="crop-checkboxes">
                    {['Rice', 'Wheat', 'Corn', 'Cotton', 'Sugarcane', 'Pulses', 'Vegetables', 'Fruits'].map(crop => (
                      <label key={crop} className="crop-checkbox">
                        <input 
                          type="checkbox" 
                          value={crop} 
                          checked={formData.crops.includes(crop)} 
                          onChange={handleCropChange}
                        />
                        <span>{crop}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'health' && (
              <div className="profile-tab-content">
                <div className="health-overview">
                  <h3>{t('profile.health.overview')}</h3>
                  <div className="health-metrics">
                    <div className="health-metric">
                      <span className="metric-icon">🌱</span>
                      <div className="metric-info">
                        <h4>{t('profile.health.overall_status')}</h4>
                        <select 
                          value={formData.farm_health.overall_health_status} 
                          onChange={(e) => setFormData({
                            ...formData, 
                            farm_health: {...formData.farm_health, overall_health_status: e.target.value}
                          })}
                          className="health-select"
                        >
                          <option value="excellent">{t('profile.health.excellent')}</option>
                          <option value="good">{t('profile.health.good')}</option>
                          <option value="fair">{t('profile.health.fair')}</option>
                          <option value="poor">{t('profile.health.poor')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="soil_ph">{t('profile.health.soil_ph')}</label>
                  <input 
                    type="number" 
                    id="soil_ph" 
                    step="0.1"
                    min="0"
                    max="14"
                    value={formData.farm_health.soil_ph} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      farm_health: {...formData.farm_health, soil_ph: e.target.value}
                    })}
                    placeholder={t('profile.health.soil_ph_placeholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="soil_health_score">{t('profile.health.soil_health_score')}</label>
                  <input 
                    type="number" 
                    id="soil_health_score"
                    min="0"
                    max="100"
                    value={formData.farm_health.soil_health_score} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      farm_health: {...formData.farm_health, soil_health_score: e.target.value}
                    })}
                    placeholder={t('profile.health.soil_score_placeholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="irrigation_system">{t('profile.health.irrigation_system')}</label>
                  <select 
                    id="irrigation_system"
                    value={formData.farm_health.irrigation_system} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      farm_health: {...formData.farm_health, irrigation_system: e.target.value}
                    })}
                  >
                    <option value="">{t('profile.health.select_irrigation')}</option>
                    <option value="drip">{t('profile.health.drip_irrigation')}</option>
                    <option value="sprinkler">{t('profile.health.sprinkler')}</option>
                    <option value="flood">{t('profile.health.flood_irrigation')}</option>
                    <option value="manual">{t('profile.health.manual_irrigation')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="fertilizer_usage">{t('profile.health.fertilizer_usage')}</label>
                  <textarea 
                    id="fertilizer_usage"
                    rows="3"
                    value={formData.farm_health.fertilizer_usage} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      farm_health: {...formData.farm_health, fertilizer_usage: e.target.value}
                    })}
                    placeholder={t('profile.health.fertilizer_placeholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_pest_inspection">{t('profile.health.last_pest_inspection')}</label>
                  <input 
                    type="date" 
                    id="last_pest_inspection"
                    value={formData.farm_health.last_pest_inspection} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      farm_health: {...formData.farm_health, last_pest_inspection: e.target.value}
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>{t('profile.health.common_pest_issues')}</label>
                  <div className="pest-checkboxes">
                    {['Aphids', 'Bollworm', 'Stem Borer', 'Whitefly', 'Thrips', 'Leaf Miner', 'Cutworm', 'None'].map(pest => (
                      <label key={pest} className="pest-checkbox">
                        <input 
                          type="checkbox" 
                          value={pest} 
                          checked={formData.farm_health.pest_issues.includes(pest)} 
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            if (checked) {
                              setFormData({
                                ...formData, 
                                farm_health: {
                                  ...formData.farm_health, 
                                  pest_issues: [...formData.farm_health.pest_issues, value]
                                }
                              });
                            } else {
                              setFormData({
                                ...formData, 
                                farm_health: {
                                  ...formData.farm_health, 
                                  pest_issues: formData.farm_health.pest_issues.filter(p => p !== value)
                                }
                              });
                            }
                          }}
                        />
                        <span>{pest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('profile.health.recent_diseases')}</label>
                  <div className="disease-checkboxes">
                    {['Rust', 'Blight', 'Wilt', 'Mosaic Virus', 'Root Rot', 'Powdery Mildew', 'Black Spot', 'None'].map(disease => (
                      <label key={disease} className="disease-checkbox">
                        <input 
                          type="checkbox" 
                          value={disease} 
                          checked={formData.farm_health.disease_history.includes(disease)} 
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            if (checked) {
                              setFormData({
                                ...formData, 
                                farm_health: {
                                  ...formData.farm_health, 
                                  disease_history: [...formData.farm_health.disease_history, value]
                                }
                              });
                            } else {
                              setFormData({
                                ...formData, 
                                farm_health: {
                                  ...formData.farm_health, 
                                  disease_history: formData.farm_health.disease_history.filter(d => d !== value)
                                }
                              });
                            }
                          }}
                        />
                        <span>{disease}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="profile-tab-content">
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? t('profile.saving') : t('profile.saveChanges')}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default Profile;
