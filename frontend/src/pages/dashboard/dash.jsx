import React from 'react';
import { useTranslation } from 'react-i18next';
import './dash.css';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import SoilWidget from '../../components/SoilWidget/SoilWidget';
import CropStatusWidget from '../../components/CropStatusWidget/CropStatusWidget';

const Dash = () => {
  const { t } = useTranslation();
  
  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>{t('dashboard.title')}</h2>
        <ul>
          <li><a href="#overview">{t('dashboard.overview')}</a></li>
          <li><a href="#weather">{t('dashboard.weather')}</a></li>
          <li><a href="#crops">{t('dashboard.my_crops')}</a></li>
          <li><a href="#soil">Soil</a></li>
          <li><a href="#organic-fertilizers">Organic Fertilizers</a></li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>{t('dashboard.welcome')}</h1>
        </div>
        <div className="widgets">
          <WeatherWidget />
          <SoilWidget />
          <CropStatusWidget />
        </div>
      </div>
    </div>
  );
};

export default Dash;