import React from 'react'
import { useTranslation } from 'react-i18next'
import './about.css'
import Navbar from '../../components/Navbar/Navbar'

const About = () => {
  const { t } = useTranslation();
  
  return (
    <div className='About'>
        <Navbar />
        <div className='about-container'>
            <h1 className='about-title'>{t('about.title')}</h1>
            <p className='about-description'>
                {t('about.description')}
            </p>
            <div className='about-features-title'>
                <h2>{t('about.features_title')}</h2>
            <ul className='about-features-list'>
                <li>{t('about.features.accuracy')}</li>
                <li>{t('about.features.weather_support')}</li>
                <li>{t('about.features.expert_guidance')}</li>
                <li>{t('about.features.community')}</li>
            </ul>
            </div>
            <div className='our-services'>
                <h2>Our Services</h2>
                <ul className='services-list'>
                    <li>Crop Analysis and Recommendations</li>
                    <li>Weather Forecasting and Alerts</li>
                    <li>Soil Health Monitoring</li>
                    <li>Pest and Disease Management</li>
                </ul>
            </div>
            <div className='mission'>
                <h2>{t('about.mission')}</h2>
                <p>
                    {t('about.mission_text')}
                    </p>
            </div>
        </div>
    </div>
  )
}

export default About