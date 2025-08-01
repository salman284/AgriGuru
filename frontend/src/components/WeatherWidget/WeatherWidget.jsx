import React, { useState, useEffect } from 'react';
import { getCurrentLocation, getCurrentWeather, getTomorrowWeather, formatTemperature, getWeatherEmoji } from '../../services/weatherService';
import './WeatherWidget.css';

const WeatherWidget = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const [tomorrowWeather, setTomorrowWeather] = useState(null);
  const [thirtyDayForecast, setThirtyDayForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    fetchWeatherData();
    fetchThirtyDayForecast();
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      let coords;
      if (location) {
        // Use city name to get coordinates (simple mapping for capitals)
        const cityCoords = cityToCoords(location);
        coords = cityCoords || await getCurrentLocation();
      } else {
        coords = await getCurrentLocation();
      }
      // Get current weather and tomorrow's forecast
      const [weatherData, tomorrowData] = await Promise.all([
        getCurrentWeather(coords.lat, coords.lon),
        getTomorrowWeather(coords.lat, coords.lon)
      ]);
      setWeather(weatherData);
      setTomorrowWeather(tomorrowData);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Map city name to coordinates
  function cityToCoords(city) {
    const map = {
      Amaravati: { lat: 16.5417, lon: 80.5177 },
      Itanagar: { lat: 27.0844, lon: 93.6053 },
      Dispur: { lat: 26.1433, lon: 91.7898 },
      Patna: { lat: 25.5941, lon: 85.1376 },
      Raipur: { lat: 21.2514, lon: 81.6296 },
      Gandhinagar: { lat: 23.2156, lon: 72.6369 },
      Chandigarh: { lat: 30.7333, lon: 76.7794 },
      Shimla: { lat: 31.1048, lon: 77.1734 },
      Ranchi: { lat: 23.3441, lon: 85.3096 },
      Bengaluru: { lat: 12.9716, lon: 77.5946 },
      Thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
      Bhopal: { lat: 23.2599, lon: 77.4126 },
      Mumbai: { lat: 19.0760, lon: 72.8777 },
      Imphal: { lat: 24.8170, lon: 93.9368 },
      Shillong: { lat: 25.5788, lon: 91.8933 },
      Aizawl: { lat: 23.7271, lon: 92.7176 },
      Kohima: { lat: 25.6701, lon: 94.1077 },
      Bhubaneswar: { lat: 20.2961, lon: 85.8245 },
      Jaipur: { lat: 26.9124, lon: 75.7873 },
      Gangtok: { lat: 27.3389, lon: 88.6065 },
      Chennai: { lat: 13.0827, lon: 80.2707 },
      Hyderabad: { lat: 17.3850, lon: 78.4867 },
      Agartala: { lat: 23.8315, lon: 91.2868 },
      Lucknow: { lat: 26.8467, lon: 80.9462 },
      Dehradun: { lat: 30.3165, lon: 78.0322 },
      Kolkata: { lat: 22.5726, lon: 88.3639 }
    };
    return map[city] || null;
  }

  // Mock: Fetch 30-day forecast (replace with real API call)
  const fetchThirtyDayForecast = async () => {
    // Generate mock data for next 30 days
    const mockThirty = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      maxTemp: Math.round(25 + Math.random() * 10),
      minTemp: Math.round(15 + Math.random() * 8),
      weatherIcon: '🌤️',
      description: 'Partly cloudy'
    }));
    setThirtyDayForecast(mockThirty);
  };

  const refreshWeather = () => {
    fetchWeatherData();
  };

  if (loading) {
    return (
      <div className="weather-widget loading">
        <h3>🌤️ Weather Forecast</h3>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <h3>🌤️ Weather Forecast</h3>
        <p className="error-message">{error}</p>
        <button onClick={refreshWeather} className="refresh-btn">
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!weather) return null;

  // Get current weather data
  const currentWeather = {
    temperature: formatTemperature(weather.main.temp),
    feelsLike: formatTemperature(weather.main.feels_like),
    humidity: weather.main.humidity,
    windSpeed: Math.round(weather.wind.speed * 3.6), // Convert m/s to km/h
    weatherEmoji: getWeatherEmoji(weather.weather[0].main),
    description: weather.weather[0].description,
    cityName: weather.name
  };

  // Get tomorrow's weather data
  const tomorrow = tomorrowWeather ? {
    temperature: formatTemperature(tomorrowWeather.main.temp),
    minTemp: formatTemperature(tomorrowWeather.main.temp_min),
    maxTemp: formatTemperature(tomorrowWeather.main.temp_max),
    humidity: tomorrowWeather.main.humidity,
    windSpeed: Math.round(tomorrowWeather.wind.speed * 3.6),
    weatherEmoji: getWeatherEmoji(tomorrowWeather.weather[0].main),
    description: tomorrowWeather.weather[0].description
  } : null;

  const renderWeatherContent = (weatherData, isToday = true) => (
    <div className="weather-content">
      <div className="weather-main">
        <div className="weather-icon">
          {weatherData.weatherEmoji}
        </div>
        <div className="weather-temp">
          <span className="temperature">
            {isToday ? `${weatherData.temperature}°C` : `${weatherData.maxTemp}°C / ${weatherData.minTemp}°C`}
          </span>
          <span className="description">{weatherData.description}</span>
        </div>
      </div>
      
      {isToday && (
        <div className="weather-location">
          📍 {weatherData.cityName}
        </div>
      )}
      
      <div className="weather-details">
        {isToday && (
          <div className="weather-detail">
            <span className="label">Feels like:</span>
            <span className="value">{weatherData.feelsLike}°C</span>
          </div>
        )}
        <div className="weather-detail">
          <span className="label">Humidity:</span>
          <span className="value">{weatherData.humidity}%</span>
        </div>
        <div className="weather-detail">
          <span className="label">Wind:</span>
          <span className="value">{weatherData.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );

  const renderThirtyDayForecast = () => (
    <div className="thirtyday-forecast" style={{ marginTop: 24 }}>
      <h4 style={{ marginBottom: 16, fontWeight: 500, fontSize: '1.20em', color: '#1a5bbf', letterSpacing: '0.5px' }}>Upcoming 30-Day Weather</h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
        justifyItems: 'center',
        overflowX: 'auto',
        minWidth: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {thirtyDayForecast.slice(0, 9).map((day, index) => (
          <div key={day.date} className="forecast-day" style={{
            background: 'linear-gradient(135deg, #e3f0ff 0%, #fafdff 100%)',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(42,123,228,0.10)',
            padding: '14px 10px 6px 10px',
            maxWidth: '80px',
            minWidth: '80px',
            maxHeight: '130px',
            textAlign: 'center',
            marginBottom: '8px',
            border: '1.5px solid #dbeafe',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'inherit'
          }}>
            <div className="day-date" style={{ fontWeight: 600, fontSize: '1em', color: '#1a5bbf', marginBottom: '4px', letterSpacing: '0.2px' }}>{day.date}</div>
            <div className="day-icon" style={{ fontSize: '2.1em', marginBottom: '4px' }}>{day.weatherIcon}</div>
            <div className="day-temps" style={{ fontSize: '1.05em', color: '#1a5bbf', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              <span className="high-temp" style={{ color: '#e67e22', fontWeight: 700 }}>▲ {day.maxTemp}°</span>
              <span className="low-temp" style={{ color: '#3498db', fontWeight: 700 }}>▼ {day.minTemp}°</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
        justifyItems: 'center',
        marginTop: '14px',
        borderTop: '1.5px solid #dbeafe',
        paddingTop: '18px',
        overflowX: 'auto',
        minWidth: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {thirtyDayForecast.slice(9).map((day, index) => (
          <div key={day.date} className="forecast-day" style={{
            background: 'linear-gradient(135deg, #e3f0ff 0%, #fafdff 100%)',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(42,123,228,0.10)',
            padding: '14px 10px 6px 10px',
            maxWidth: '80px',
            minWidth: '80px',
            maxHeight: '130px',
            textAlign: 'center',
            marginBottom: '8px',
            border: '1.5px solid #dbeafe',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'inherit'
          }}>
            <div className="day-date" style={{ fontWeight: 600, fontSize: '1em', color: '#1a5bbf', marginBottom: '4px', letterSpacing: '0.2px' }}>{day.date}</div>
            <div className="day-icon" style={{ fontSize: '2.1em', marginBottom: '4px' }}>{day.weatherIcon}</div>
            <div className="day-temps" style={{ fontSize: '1.05em', color: '#1a5bbf', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              <span className="high-temp" style={{ color: '#e67e22', fontWeight: 700 }}>▲ {day.maxTemp}°</span>
              <span className="low-temp" style={{ color: '#3498db', fontWeight: 700 }}>▼ {day.minTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="weather-widget">
      <div className="weather-header">
        <h3>🌤️ Weather Forecast</h3>
        <button onClick={refreshWeather} className="refresh-btn" title="Refresh Weather">
          🔄
        </button>
      </div>
      
      {/* Tab Navigation */}
      <div className="weather-tabs">
        <button 
          className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Today
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tomorrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('tomorrow')}
          disabled={!tomorrowWeather}
        >
          Tomorrow
        </button>
      </div>
      
      {/* Weather Content */}
      {activeTab === 'today' && renderWeatherContent(currentWeather, true)}
      {activeTab === 'tomorrow' && tomorrow && renderWeatherContent(tomorrow, false)}
      {activeTab === 'tomorrow' && !tomorrow && (
        <div className="weather-content">
          <p style={{ textAlign: 'center', opacity: 0.8, padding: '20px' }}>
            Tomorrow's forecast not available
          </p>
        </div>
      )}
      
      {/* 30-Day Forecast (first 9 days as day name, next 21 days as date) */}
      {thirtyDayForecast.length > 0 && renderThirtyDayForecast()}
    </div>
  );
};

export default WeatherWidget;
