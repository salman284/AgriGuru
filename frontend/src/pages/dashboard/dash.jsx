import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './dash.css';
import WeatherWidget from '../../components/WeatherWidget/WeatherWidget';
import SoilWidget from '../../components/SoilWidget/SoilWidget';
import CropStatusWidget from '../../components/CropStatusWidget/CropStatusWidget';

const Dash = () => {
  const { t } = useTranslation('common');
  const [selectedLocation, setSelectedLocation] = useState("");
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
          <li><a href="#weather">{t('dashboard.weather')}</a></li>
          <li><a href="#crops">{t('dashboard.my_crops')}</a></li>
          <li><a href="#soil">Soil</a></li>
          <li><a href="#organic-fertilizers">Organic Fertilizers</a></li>
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
          <WeatherWidget location={selectedLocation} />
          <SoilWidget location={selectedLocation} />
          <CropStatusWidget />
        </div>
      </div>
    </div>
  );
};

export default Dash;