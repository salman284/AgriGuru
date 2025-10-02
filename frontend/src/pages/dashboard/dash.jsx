import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './dash.css';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import SoilWidget from '../../components/SoilWidget/SoilWidget';
import CropStatusWidget from '../../components/CropStatusWidget/CropStatusWidget';
import YieldPrediction from '../../components/yieldPrediction/yield';
import PestDetection from '../../components/pestDetection/pestDetection';
import SmartIrrigation from '../../components/smartIrrigation/smartIrrigation';
import PestWidget from '../../components/PestWidget/PestWidget';
import IrrigationWidget from '../../components/IrrigationWidget/IrrigationWidget';
import FertilizerWidget from '../../components/FertilizerWidget';
import FertilizerOptimizer from '../fertilizer/fertilizerOptimizer';


const Dash = () => {
  const { t } = useTranslation('common');
  const [selectedLocation, setSelectedLocation] = useState("");
  const [weatherHighlight, setWeatherHighlight] = useState(false);
  const [soilHighlight, setSoilHighlight] = useState(false);
  const weatherRef = useRef(null);
  const soilRef = useRef(null);
  const cropRef = useRef(null);
  const yieldRef = useRef(null);
  const [cropHighlight, setCropHighlight] = useState(false);
  const [yieldHighlight, setYieldHighlight] = useState(false);
  
  // Modal state management
  const [activeModal, setActiveModal] = useState(null);

  // Handle modal open/close
  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };
  // Optionally, get user's current location if nothing is selected
  useEffect(() => {
    if (!selectedLocation && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        (pos) => {
          // You can use pos.coords.latitude/longitude to fetch weather/soil for current location
        },
        (err) => {
          // Handle error if needed
        }
      );
    }
  }, [selectedLocation]);
  
  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>{t('dashboard.title')}</h2>
        <ul>
          <li><a href="#overview">{t('dashboard.overview')}</a></li>
          <li>
            <a
              href="#weather"
              onClick={e => {
                e.preventDefault();
                openModal('weather');
              }}
            >
              Weather Forecast
            </a>
          </li>
          <li>
            <a
              href="#crops"
              onClick={e => {
                e.preventDefault();
                openModal('crops');
              }}
            >
              Crop Analysis
            </a>
          </li>
          <li>
            <a
              href="#soil"
              onClick={e => {
                e.preventDefault();
                openModal('soil');
              }}
            >
              Soil Health
            </a>
          </li>
          <li>
            <a
              href="#yield"
              onClick={e => {
                e.preventDefault();
                openModal('yield');
              }}
            >
              Yield Prediction
            </a>
          </li>
          <li>
            <a
              href="#pest"
              onClick={e => {
                e.preventDefault();
                openModal('pest');
              }}
            >
              🐛 Pest Detection
            </a>
          </li>
          <li>
            <a
              href="#irrigation"
              onClick={e => {
                e.preventDefault();
                openModal('irrigation');
              }}
            >
              💧 Smart Irrigation
            </a>
          </li>
          <li>
            <a 
              href="#organic-fertilizers"
              onClick={e => {
                e.preventDefault();
                openModal('fertilizers');
              }}
            >
              Organic Fertilizers
            </a>
          </li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>{t('dashboard.welcome')}</h1>
          <div style={{ marginTop: '18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', width: '260px' }}
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
            >
              <option value="" disabled>Select area (State Capital)</option>
              <option value="Amaravati">Andhra Pradesh - Amaravati</option>
              <option value="Itanagar">Arunachal Pradesh - Itanagar</option>
              <option value="Dispur">Assam - Dispur</option>
              <option value="Patna">Bihar - Patna</option>
              <option value="Raipur">Chhattisgarh - Raipur</option>
              <option value="Gandhinagar">Gujarat - Gandhinagar</option>
              <option value="Chandigarh">Haryana - Chandigarh</option>
              <option value="Shimla">Himachal Pradesh - Shimla</option>
              <option value="Ranchi">Jharkhand - Ranchi</option>
              <option value="Bengaluru">Karnataka - Bengaluru</option>
              <option value="Thiruvananthapuram">Kerala - Thiruvananthapuram</option>
              <option value="Bhopal">Madhya Pradesh - Bhopal</option>
              <option value="Mumbai">Maharashtra - Mumbai</option>
              <option value="Imphal">Manipur - Imphal</option>
              <option value="Shillong">Meghalaya - Shillong</option>
              <option value="Aizawl">Mizoram - Aizawl</option>
              <option value="Kohima">Nagaland - Kohima</option>
              <option value="Bhubaneswar">Odisha - Bhubaneswar</option>
              <option value="Jaipur">Rajasthan - Jaipur</option>
              <option value="Gangtok">Sikkim - Gangtok</option>
              <option value="Chennai">Tamil Nadu - Chennai</option>
              <option value="Hyderabad">Telangana - Hyderabad</option>
              <option value="Agartala">Tripura - Agartala</option>
              <option value="Lucknow">Uttar Pradesh - Lucknow</option>
              <option value="Dehradun">Uttarakhand - Dehradun</option>
              <option value="Kolkata">West Bengal - Kolkata</option>
            </select>
          </div>
        </div>
        <div className="widgets">
          <div className="widgets-grid">
            <div
              ref={weatherRef}
              id="weather"
              className={weatherHighlight ? 'widget widget-highlight' : 'widget'}
              onAnimationEnd={() => setWeatherHighlight(false)}
              onClick={() => openModal('weather')}
            >
              <WeatherWidget location={selectedLocation} />
            </div>
            <div
              ref={soilRef}
              id="soil"
              className={soilHighlight ? 'widget widget-highlight' : 'widget'}
              onAnimationEnd={() => setSoilHighlight(false)}
              onClick={() => openModal('soil')}
            >
              <SoilWidget location={selectedLocation} />
            </div>
            <div
              ref={cropRef}
              id="crops"
              className={cropHighlight ? 'widget widget-highlight' : 'widget'}
              onAnimationEnd={() => setCropHighlight(false)}
              onClick={() => openModal('crops')}
            >
              <CropStatusWidget />
            </div>
            <div
              id="fertilizer"
              className="widget"
              onClick={() => openModal('fertilizer')}
            >
              <FertilizerWidget />
            </div>
            <div
              id="pest"
              className="widget"
              onClick={() => openModal('pest')}
            >
              <PestWidget />
            </div>
            <div
              id="irrigation"
              className="widget"
              onClick={() => openModal('irrigation')}
            >
              <IrrigationWidget />
            </div>
          </div>
          
          {/* Yield Prediction - Full Width Row */}
          <div className="yield-section">
            <div
              ref={yieldRef}
              id="yield"
              className={yieldHighlight ? 'widget widget-yield widget-highlight' : 'widget widget-yield'}
              onAnimationEnd={() => setYieldHighlight(false)}
              onClick={() => openModal('yield')}
            >
              <YieldPrediction location={selectedLocation} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {activeModal === 'weather' && '🌤️ Weather Forecast'}
                {activeModal === 'crops' && '🌾 Crop Analysis'}
                {activeModal === 'soil' && '🌱 Soil Health'}
                {activeModal === 'yield' && '📊 Yield Prediction'}
                {activeModal === 'pest' && '🐛 Pest Detection & Analysis'}
                {activeModal === 'irrigation' && '💧 Smart Irrigation System'}
                {activeModal === 'fertilizer' && '🧪 Fertilizer Optimizer'}
                {activeModal === 'fertilizers' && '🧪 Organic Fertilizers'}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {activeModal === 'weather' && (
                <div className="modal-widget">
                  <WeatherWidget location={selectedLocation} />
                </div>
              )}
              {activeModal === 'crops' && (
                <div className="modal-widget">
                  <CropStatusWidget />
                </div>
              )}
              {activeModal === 'soil' && (
                <div className="modal-widget">
                  <SoilWidget location={selectedLocation} />
                </div>
              )}
              {activeModal === 'yield' && (
                <div className="modal-widget">
                  <YieldPrediction location={selectedLocation} />
                </div>
              )}
              {activeModal === 'pest' && (
                <div className="modal-widget">
                  <PestDetection />
                </div>
              )}
              {activeModal === 'irrigation' && (
                <div className="modal-widget">
                  <SmartIrrigation />
                </div>
              )}
              {activeModal === 'fertilizer' && (
                <FertilizerOptimizer onClose={closeModal} />
              )}
              {activeModal === 'fertilizers' && (
                <div className="fertilizer-modal-content">
                  <div className="fertilizer-info">
                    <h3>🌿 Natural & Sustainable Solutions</h3>
                    <p>Discover organic fertilizers that improve soil health while protecting the environment:</p>
                    <ul>
                      <li><strong>Compost:</strong> Rich in nutrients, improves soil structure and water retention</li>
                      <li><strong>Vermicompost:</strong> Earthworm-processed organic matter with enhanced nutrients</li>
                      <li><strong>Green Manure:</strong> Nitrogen-fixing cover crops that enrich soil naturally</li>
                      <li><strong>Bio-fertilizers:</strong> Beneficial microorganisms that promote plant growth</li>
                      <li><strong>Organic Liquid Fertilizers:</strong> Fast-acting nutrients for quick absorption</li>
                    </ul>
                  </div>
                  <div className="download-section">
                    <h3>📄 Complete Guide</h3>
                    <p>Download our comprehensive organic fertilizers guide with detailed instructions.</p>
                    <a
                      href="/Organic-Fertilizers-Guide.pdf"
                      download
                      className="download-btn-modal"
                    >
                      📥 Download PDF Guide
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dash;