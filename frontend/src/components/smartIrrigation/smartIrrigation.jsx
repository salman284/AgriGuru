import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Cloud, 
  Zap, 
  Wifi, 
  Battery, 
  Play, 
  Pause, 
  Settings,
  TrendingUp,
  Calendar,
  MapPin,
  Smartphone
} from 'lucide-react';
import smartIrrigationService from '../../services/smartIrrigationService';
import './smartIrrigation.css';

const SmartIrrigation = () => {
  const [irrigationStatus, setIrrigationStatus] = useState('auto');
  const [sensorData, setSensorData] = useState({
    soilMoisture: 45,
    temperature: 28,
    humidity: 62,
    lightIntensity: 75,
    pH: 6.8,
    waterLevel: 85
  });
  const [iotDevices] = useState([
    {
      id: 'sensor-001',
      name: 'Field Sensor A1',
      type: 'Soil Moisture',
      status: 'online',
      battery: 87,
      location: 'Zone A',
      lastUpdate: '2 mins ago'
    },
    {
      id: 'valve-001',
      name: 'Main Irrigation Valve',
      type: 'Water Valve',
      status: 'online',
      battery: 92,
      location: 'Pump House',
      lastUpdate: '1 min ago'
    },
    {
      id: 'weather-001',
      name: 'Weather Station',
      type: 'Weather Monitor',
      status: 'online',
      battery: 78,
      location: 'Central Field',
      lastUpdate: '30 secs ago'
    },
    {
      id: 'pump-001',
      name: 'Water Pump Controller',
      type: 'Pump Control',
      status: 'offline',
      battery: 45,
      location: 'Pump House',
      lastUpdate: '15 mins ago'
    }
  ]);
  
  const [irrigationSchedule] = useState([
    { time: '06:00', duration: '30 min', zone: 'Zone A', status: 'completed' },
    { time: '12:00', duration: '20 min', zone: 'Zone B', status: 'active' },
    { time: '18:00', duration: '25 min', zone: 'Zone C', status: 'scheduled' },
    { time: '22:00', duration: '15 min', zone: 'Zone A', status: 'scheduled' }
  ]);

  const [currentWeather] = useState({
    condition: 'Partly Cloudy',
    temperature: 32,
    humidity: 58,
    rainfall: 0,
    windSpeed: 12,
    forecast: [
      { day: 'Today', temp: 32, condition: 'Partly Cloudy', rain: 0 },
      { day: 'Tomorrow', temp: 29, condition: 'Rainy', rain: 15 },
      { day: 'Thursday', temp: 31, condition: 'Sunny', rain: 0 },
      { day: 'Friday', temp: 28, condition: 'Cloudy', rain: 5 }
    ]
  });

  // Initialize IoT connection and real-time sensor data updates
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        await smartIrrigationService.initializeIoTConnection();
        
        // Get initial sensor data
        const response = await smartIrrigationService.getSensorData();
        if (response.success && response.data.devices['sensor-001']) {
          const sensorReading = response.data.devices['sensor-001'].readings;
          setSensorData({
            soilMoisture: sensorReading.soilMoisture,
            temperature: sensorReading.temperature,
            humidity: response.data.devices['sensor-002']?.readings.humidity || 62,
            lightIntensity: sensorReading.lightIntensity,
            pH: sensorReading.soilPH,
            waterLevel: response.data.devices['pump-001']?.readings.waterLevel || 85
          });
        }
      } catch (error) {
        console.error('Failed to initialize irrigation system:', error);
      }
    };

    initializeSystem();

    // Listen for real-time sensor updates
    const handleSensorUpdate = (event) => {
      const data = event.detail;
      if (data.devices && data.devices['sensor-001']) {
        const sensorReading = data.devices['sensor-001'].readings;
        setSensorData(prev => ({
          ...prev,
          soilMoisture: sensorReading.soilMoisture,
          temperature: sensorReading.temperature,
          humidity: data.devices['sensor-002']?.readings.humidity || prev.humidity,
          pH: sensorReading.soilPH,
          waterLevel: data.devices['pump-001']?.readings.waterLevel || prev.waterLevel
        }));
      }
    };

    window.addEventListener('sensorDataUpdate', handleSensorUpdate);

    return () => {
      window.removeEventListener('sensorDataUpdate', handleSensorUpdate);
      smartIrrigationService.stopSensorDataStream();
    };
  }, []);

  const toggleIrrigation = async (mode) => {
    try {
      const response = await smartIrrigationService.controlIrrigation(mode);
      if (response.success) {
        setIrrigationStatus(mode);
        console.log('✅', response.message);
      }
    } catch (error) {
      console.error('Failed to toggle irrigation:', error);
    }
  };

  const startIrrigation = async () => {
    try {
      const response = await smartIrrigationService.controlIrrigation('start', 'Zone A', 30);
      if (response.success) {
        console.log('✅', response.message);
      }
    } catch (error) {
      console.error('Failed to start irrigation:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getIrrigationStatusColor = () => {
    switch (irrigationStatus) {
      case 'auto': return '#10b981';
      case 'manual': return '#3b82f6';
      case 'off': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getMoistureLevel = (moisture) => {
    if (moisture < 30) return { level: 'Low', color: '#ef4444' };
    if (moisture < 60) return { level: 'Optimal', color: '#10b981' };
    return { level: 'High', color: '#3b82f6' };
  };

  return (
    <div className="smart-irrigation-container">
      <div className="irrigation-header">
        <div className="header-content">
          <Droplets className="header-icon" />
          <div>
            <h2>💧 Smart Irrigation System</h2>
            <p>AI-powered irrigation with real-time IoT monitoring and automated control</p>
          </div>
        </div>
      </div>

      <div className="irrigation-content">
        {/* Control Panel */}
        <div className="control-panel">
          <div className="panel-header">
            <h3>🎛️ System Control</h3>
            <div className="system-status">
              <div 
                className="status-indicator"
                style={{ backgroundColor: getIrrigationStatusColor() }}
              ></div>
              <span className="status-text">
                {irrigationStatus.charAt(0).toUpperCase() + irrigationStatus.slice(1)} Mode
              </span>
            </div>
          </div>

          <div className="control-buttons">
            <button 
              className={`control-btn ${irrigationStatus === 'auto' ? 'active' : ''}`}
              onClick={() => toggleIrrigation('auto')}
            >
              <Zap size={20} />
              Auto Mode
            </button>
            <button 
              className={`control-btn ${irrigationStatus === 'manual' ? 'active' : ''}`}
              onClick={() => toggleIrrigation('manual')}
            >
              <Smartphone size={20} />
              Manual
            </button>
            <button 
              className={`control-btn ${irrigationStatus === 'off' ? 'active' : ''}`}
              onClick={() => toggleIrrigation('off')}
            >
              <Pause size={20} />
              Off
            </button>
          </div>

          <div className="irrigation-actions">
            <button className="action-btn primary" onClick={startIrrigation}>
              <Play size={16} />
              Start Irrigation
            </button>
            <button className="action-btn secondary">
              <Settings size={16} />
              Configure Schedule
            </button>
          </div>
        </div>

        {/* Real-time Sensor Data */}
        <div className="sensor-grid">
          <div className="sensor-card">
            <div className="sensor-header">
              <Droplets className="sensor-icon moisture" />
              <div>
                <h4>Soil Moisture</h4>
                <p className="sensor-location">Zone A - Field Sensor</p>
              </div>
            </div>
            <div className="sensor-value">
              <span className="value">{sensorData.soilMoisture}%</span>
              <div 
                className="status-badge"
                style={{ backgroundColor: getMoistureLevel(sensorData.soilMoisture).color }}
              >
                {getMoistureLevel(sensorData.soilMoisture).level}
              </div>
            </div>
            <div className="sensor-chart">
              <div className="mini-chart">
                <div className="chart-bar" style={{ height: `${sensorData.soilMoisture}%` }}></div>
              </div>
            </div>
          </div>

          <div className="sensor-card">
            <div className="sensor-header">
              <Thermometer className="sensor-icon temperature" />
              <div>
                <h4>Temperature</h4>
                <p className="sensor-location">Zone A - Field Sensor</p>
              </div>
            </div>
            <div className="sensor-value">
              <span className="value">{sensorData.temperature}°C</span>
              <div className="status-badge good">Normal</div>
            </div>
            <div className="sensor-chart">
              <div className="mini-chart">
                <div className="chart-bar" style={{ height: `${(sensorData.temperature / 40) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="sensor-card">
            <div className="sensor-header">
              <Cloud className="sensor-icon humidity" />
              <div>
                <h4>Humidity</h4>
                <p className="sensor-location">Weather Station</p>
              </div>
            </div>
            <div className="sensor-value">
              <span className="value">{sensorData.humidity}%</span>
              <div className="status-badge good">Good</div>
            </div>
            <div className="sensor-chart">
              <div className="mini-chart">
                <div className="chart-bar" style={{ height: `${sensorData.humidity}%` }}></div>
              </div>
            </div>
          </div>

          <div className="sensor-card">
            <div className="sensor-header">
              <TrendingUp className="sensor-icon ph" />
              <div>
                <h4>Soil pH</h4>
                <p className="sensor-location">Zone A - Soil Probe</p>
              </div>
            </div>
            <div className="sensor-value">
              <span className="value">{sensorData.pH}</span>
              <div className="status-badge good">Optimal</div>
            </div>
            <div className="sensor-chart">
              <div className="mini-chart">
                <div className="chart-bar" style={{ height: `${(sensorData.pH / 14) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* IoT Devices Status */}
        <div className="iot-section">
          <h3>📡 IoT Device Network</h3>
          <div className="device-grid">
            {iotDevices.map(device => (
              <div key={device.id} className="device-card">
                <div className="device-header">
                  <div className="device-info">
                    <h4>{device.name}</h4>
                    <p>{device.type}</p>
                  </div>
                  <div 
                    className="device-status"
                    style={{ backgroundColor: getStatusColor(device.status) }}
                  >
                    <Wifi size={16} />
                  </div>
                </div>
                <div className="device-details">
                  <div className="detail-item">
                    <MapPin size={14} />
                    <span>{device.location}</span>
                  </div>
                  <div className="detail-item">
                    <Battery size={14} />
                    <span>{device.battery}%</span>
                  </div>
                  <div className="detail-item">
                    <Calendar size={14} />
                    <span>{device.lastUpdate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Irrigation Schedule */}
        <div className="schedule-section">
          <h3>⏰ Today's Irrigation Schedule</h3>
          <div className="schedule-list">
            {irrigationSchedule.map((schedule, index) => (
              <div key={index} className={`schedule-item ${schedule.status}`}>
                <div className="schedule-time">
                  <span className="time">{schedule.time}</span>
                  <span className="duration">{schedule.duration}</span>
                </div>
                <div className="schedule-zone">
                  <MapPin size={16} />
                  <span>{schedule.zone}</span>
                </div>
                <div className={`schedule-status ${schedule.status}`}>
                  {schedule.status === 'completed' && '✅ Completed'}
                  {schedule.status === 'active' && '🟢 Active'}
                  {schedule.status === 'scheduled' && '⏳ Scheduled'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Integration */}
        <div className="weather-section">
          <h3>🌤️ Weather-Based Intelligence</h3>
          <div className="weather-current">
            <div className="current-weather">
              <div className="weather-main">
                <h4>{currentWeather.condition}</h4>
                <div className="weather-temp">{currentWeather.temperature}°C</div>
              </div>
              <div className="weather-details">
                <div className="weather-detail">
                  <span>Humidity: {currentWeather.humidity}%</span>
                </div>
                <div className="weather-detail">
                  <span>Wind: {currentWeather.windSpeed} km/h</span>
                </div>
                <div className="weather-detail">
                  <span>Rainfall: {currentWeather.rainfall}mm</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="weather-forecast">
            {currentWeather.forecast.map((day, index) => (
              <div key={index} className="forecast-day">
                <div className="forecast-date">{day.day}</div>
                <div className="forecast-temp">{day.temp}°C</div>
                <div className="forecast-condition">{day.condition}</div>
                <div className="forecast-rain">{day.rain}mm</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Analytics */}
        <div className="analytics-section">
          <h3>📊 System Performance</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-icon">💧</div>
              <div className="analytics-data">
                <h4>2,450L</h4>
                <p>Water Used Today</p>
                <span className="analytics-trend positive">-12% vs yesterday</span>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">⚡</div>
              <div className="analytics-data">
                <h4>4.2 kWh</h4>
                <p>Energy Consumed</p>
                <span className="analytics-trend positive">-8% vs yesterday</span>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">📈</div>
              <div className="analytics-data">
                <h4>94%</h4>
                <p>System Efficiency</p>
                <span className="analytics-trend positive">+3% this week</span>
              </div>
            </div>
            <div className="analytics-card">
              <div className="analytics-icon">💰</div>
              <div className="analytics-data">
                <h4>₹245</h4>
                <p>Cost Savings</p>
                <span className="analytics-trend positive">+15% this month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartIrrigation;