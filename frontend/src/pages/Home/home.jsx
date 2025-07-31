import React from 'react'
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import "./home.css"
import backGround from "./homebg.avif"
import Navbar from "../../components/Navbar/Navbar"
import AIChat from "../../components/AIChat/AIChat"

import ChatBox from "../../components/chatBox/chat"
import { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // TODO: Fetch users if needed
    setUsers([{ id: 1, name: "Demo Farmer" }, { id: 2, name: "Other Farmer" }]);
  }, []);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="home-container">
      <Navbar />
      <div 
        className="homebg" 
        style={{
          backgroundImage: `url(${backGround})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh'
        }}
      >
        <div className="content">
          <h1 className="home-title">{t('homepage.hero.title')}</h1>
            <h3 className="home-description">
                {t('homepage.hero.description')}
            </h3>
            <button className="home-button" onClick={handleGetStarted}>{t('homepage.hero.cta_primary')}</button>
                {/* Features Section */}
                <div className="features-container">
                  <div className="feature-box">
                    <div className="feature-icon">🎯</div>
                    <h4 className="feature-title">{t('homepage.features.ai_chat.title')}</h4>
                    <p className="feature-description">{t('homepage.features.ai_chat.description')}</p>
                  </div>
                  <div className="feature-box">
                    <div className="feature-icon">👨‍🌾</div>
                    <h4 className="feature-title">{t('homepage.features.expert_advice.title')}</h4>
                    <p className="feature-description">{t('homepage.features.expert_advice.description')}</p>
                  </div>
                  <div className="feature-box">
                    <div className="feature-icon">🌤️</div>
                    <h4 className="feature-title">{t('homepage.features.weather_integration.title')}</h4>
                    <p className="feature-description">{t('homepage.features.weather_integration.description')}</p>
                  </div>
                  <div 
                    className="feature-box marketplace-feature" 
                    onClick={() => navigate('/marketplace')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="feature-icon">🛒</div>
                    <h4 className="feature-title">{t('ecommerce.title')}</h4>
                    <p className="feature-description">{t('ecommerce.subtitle')}</p>
                  </div>
                </div>
        </div>
      </div>
      {/* Farmer ChatBar (floating icon and chat) */}
      {/* Always render ChatBox, but pass currentUser as null until login. ChatBox will handle hiding itself. */}
      <ChatBox currentUser={currentUser} users={users} />
      {/* AI Chat Component */}
      <AIChat />
    </div>
  )
}

export default Home
