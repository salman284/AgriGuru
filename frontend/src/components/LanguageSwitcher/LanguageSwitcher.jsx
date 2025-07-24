import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode) => {
    console.log('🔄 Changing language to:', languageCode);
    console.log('📊 Before change - Current language:', i18n.language);
    
    i18n.changeLanguage(languageCode).then(() => {
      console.log('✅ Language changed successfully to:', i18n.language);
      
      // Force re-render by updating React state
      setIsOpen(false);
      
      // Test a translation
      const testTranslation = i18n.t('navbar.home', { lng: languageCode });
      console.log('🧪 Test translation (navbar.home):', testTranslation);
      
      // Force page reload for stubborn components
      window.location.reload();
    });
    
    // Store language preference in localStorage
    localStorage.setItem('preferredLanguage', languageCode);
    localStorage.setItem('agriguru_language', languageCode);
    
    // Update document direction for RTL languages if needed
    document.documentElement.setAttribute('dir', languageCode === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', languageCode);
    
    console.log('💾 Language saved to localStorage:', languageCode);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.language-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="language-switcher">
      <button 
        className="language-selector"
        onClick={toggleDropdown}
        aria-label={t('navbar.language')}
        aria-expanded={isOpen}
      >
        <span className="language-icon">🌐</span>
        <span className="language-text">{currentLanguage.native}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <div className="language-dropdown-header">
            <span className="dropdown-title">{t('navbar.language')}</span>
          </div>
          <div className="language-options">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`language-option ${
                  i18n.language === language.code ? 'active' : ''
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <span className="language-native">{language.native}</span>
                <span className="language-english">({language.name})</span>
                {i18n.language === language.code && (
                  <span className="checkmark">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
