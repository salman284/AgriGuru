import React from 'react';
import { useTranslation } from 'react-i18next';
import './govtS.css';
import Navbar from '../../components/Navbar/Navbar';

const GovtSchemes = () => {
  const { t } = useTranslation('common');
  
  const schemes = [
    {
      id: 1,
      title: t('government.schemes.pm_kisan.title'),
      description: t('government.schemes.pm_kisan.description'),
      eligibility: t('government.schemes.pm_kisan.eligibility'),
      benefits: [
        t('government.schemes.pm_kisan.benefits.financial_support'),
        t('government.schemes.pm_kisan.benefits.installments'),
        t('government.schemes.pm_kisan.benefits.direct_transfer')
      ],
      icon: "🌾",
      officialUrl: "https://pmkisan.gov.in/"
    },
    {
      id: 2,
      title: t('government.schemes.fasal_bima.title'),
      description: t('government.schemes.fasal_bima.description'),
      eligibility: t('government.schemes.fasal_bima.eligibility'),
      benefits: [
        t('government.schemes.fasal_bima.benefits.crop_protection'),
        t('government.schemes.fasal_bima.benefits.low_premium'),
        t('government.schemes.fasal_bima.benefits.quick_settlement')
      ],
      icon: "🛡️",
      officialUrl: "https://pmfby.gov.in/"
    },
    {
      id: 3,
      title: t('government.schemes.kisan_credit.title'),
      description: t('government.schemes.kisan_credit.description'),
      eligibility: t('government.schemes.kisan_credit.eligibility'),
      benefits: [
        t('government.schemes.kisan_credit.benefits.easy_credit'),
        t('government.schemes.kisan_credit.benefits.flexible_repayment'),
        t('government.schemes.kisan_credit.benefits.lower_rates')
      ],
      icon: "💳",
      officialUrl: "https://www.nabard.org/content1.aspx?id=1720&catid=23&mid=23"
    },
    {
      id: 4,
      title: t('government.schemes.soil_health.title'),
      description: t('government.schemes.soil_health.description'),
      eligibility: t('government.schemes.soil_health.eligibility'),
      benefits: [
        t('government.schemes.soil_health.benefits.free_testing'),
        t('government.schemes.soil_health.benefits.fertilizer_recommendations'),
        t('government.schemes.soil_health.benefits.improved_yield')
      ],
      icon: "🌱",
      officialUrl: "https://soilhealth.dac.gov.in/"
    },
    {
      id: 5,
      title: t('government.schemes.pm_sinchai.title'),
      description: t('government.schemes.pm_sinchai.description'),
      eligibility: t('government.schemes.pm_sinchai.eligibility'),
      benefits: [
        t('government.schemes.pm_sinchai.benefits.micro_irrigation'),
        t('government.schemes.pm_sinchai.benefits.water_conservation'),
        t('government.schemes.pm_sinchai.benefits.water_efficiency'),
        t('government.schemes.pm_sinchai.benefits.sustainable_practices')
      ],
      icon: "💧",
      officialUrl: "https://pmksy.gov.in/"
    },
    {
      id: 6,
      title: t('government.schemes.enam.title'),
      description: t('government.schemes.enam.description'),
      eligibility: t('government.schemes.enam.eligibility'),
      benefits: [
        t('government.schemes.enam.benefits.market_access'),
        t('government.schemes.enam.benefits.price_discovery'),
        t('government.schemes.enam.benefits.transparent_auction'),
        t('government.schemes.enam.benefits.reduced_fees')
      ],
      icon: "🏪",
      officialUrl: "https://www.enam.gov.in/"
    }
  ];

  const handleLearnMore = (url) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  return (
    <div className="government-schemes">
      <Navbar />
      <div className="schemes-container">
        <div className="schemes-header">
          <h1>🏛️ {t('government.title')}</h1>
          <p>{t('government.subtitle')}</p>
        </div>
        
        <div className="schemes-grid">
          {schemes.map(scheme => (
            <div key={scheme.id} className="scheme-card">
              <div className="scheme-icon">{scheme.icon}</div>
              <h2>{scheme.title}</h2>
              <p className="scheme-description">{scheme.description}</p>
              <div className="scheme-details">
                <div className="eligibility">
                  <h3>{t('government.eligibility')}</h3>
                  <p>{scheme.eligibility}</p>
                </div>
                <div className="benefits">
                  <h3>{t('government.benefits')}</h3>
                  <ul>
                    {scheme.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button 
                className="learn-more-btn" 
                onClick={() => handleLearnMore(scheme.officialUrl)}
              >
                {t('government.learn_more')} 🔗
              </button>
            </div>
          ))}
        </div>

        <div className="contact-section">
          <h2>{t('government.help_title')}</h2>
          <p>{t('government.help_description')}</p>
          <a href={`tel:${t('government.toll_free')}`} className="helpline-btn">
            📞 {t('government.toll_free')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default GovtSchemes;