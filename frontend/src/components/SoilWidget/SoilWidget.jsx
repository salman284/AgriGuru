import React, { useState, useEffect } from 'react';
import { analyzeSoilHealth, getSoilType, getSoilColor, getSoilHealthEmoji, recommendCropsForSoil } from '../../services/soilService';
import './SoilWidget.css';


const SoilWidget = ({ location: locationProp }) => {
  const [soilData, setSoilData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });

  useEffect(() => {
    const fetchSoilData = async () => {
      setLoading(true);
      let coords;
      if (locationProp) {
        coords = cityToCoords(locationProp);
      }
      if (!coords) {
        // Get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              setLocation({ lat, lon });
              const data = await fetchAgromonitoringSoil(lat, lon);
              setSoilData(data);
              if (data.error) {
                setError(data.error);
                setAnalysis(null);
              } else {
                const soilAnalysis = analyzeSoilHealth(data);
                setAnalysis(soilAnalysis);
                setError(null);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Geolocation error:', error);
              // Use default location (Delhi, India) if geolocation fails
              const defaultLat = 28.6139;
              const defaultLon = 77.2090;
              setLocation({ lat: defaultLat, lon: defaultLon });
              fetchAgromonitoringSoil(defaultLat, defaultLon)
                .then(data => {
                  setSoilData(data);
                  if (data.error) {
                    setError(data.error);
                    setAnalysis(null);
                  } else {
                    const soilAnalysis = analyzeSoilHealth(data);
                    setAnalysis(soilAnalysis);
                    setError('Location access denied. Showing sample data for Delhi, India.');
                  }
                })
                .catch(err => {
                  console.error('Error with fallback soil data:', err);
                  setError('Unable to fetch soil data');
                  setAnalysis(null);
                })
                .finally(() => setLoading(false));
            }
          );
        } else {
          setError('Geolocation not supported');
          setLoading(false);
        }
      } else {
        setLocation(coords);
        const data = await fetchAgromonitoringSoil(coords.lat, coords.lon);
        setSoilData(data);
        if (data.error) {
          setError(data.error);
          setAnalysis(null);
        } else {
          const soilAnalysis = analyzeSoilHealth(data);
          setAnalysis(soilAnalysis);
          setError(null);
        }
        setLoading(false);
      }
    };
    fetchSoilData();
  }, [locationProp]);

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
    // ...existing code...

  const refreshSoilData = async () => {
    if (location.lat && location.lon) {
      setLoading(true);
      try {
        const data = await fetchAgromonitoringSoil(location.lat, location.lon);
        setSoilData(data);
        const soilAnalysis = analyzeSoilHealth(data);
        setAnalysis(soilAnalysis);
        setError(null);
      } catch (err) {
        console.error('Error refreshing soil data:', err);
        setError('Unable to refresh soil data');
      } finally {
        setLoading(false);
      }
    }
  };
// Helper: Fetch soil data from Agromonitoring API
async function fetchAgromonitoringSoil(lat, lon) {
  const appid = '712c228fd2c3e40a861d87a748293bf2';
  const url = `http://api.agromonitoring.com/agro/1.0/soil?lat=${lat}&lon=${lon}&appid=${appid}`;
  try {
    const response = await fetch(url);
    if (response.status === 401) {
      return { error: 'API key is not active or not authorized for soil data. Please check your Agromonitoring dashboard.' };
    }
    if (!response.ok) {
      return { error: `API error: ${response.status}` };
    }
    const result = await response.json();
    // Map Agromonitoring response to widget fields, but use fallback only if field is undefined (not if 0)
    return {
      sand: typeof result.sand === 'number' ? result.sand : 45,
      clay: typeof result.clay === 'number' ? result.clay : 25,
      silt: typeof result.silt === 'number' ? result.silt : 30,
      ph: typeof result.ph === 'number' ? result.ph : 6.8,
      nitrogen: typeof result.n === 'number' ? result.n : 85,
      organicCarbon: typeof result.oc === 'number' ? result.oc : 2.3,
      moisture: typeof result.moisture === 'number' ? result.moisture : undefined,
      location: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
      depth: result.depth || '0-30cm',
      isRealTime: true,
      lastUpdated: new Date().toLocaleString(),
      data: result
    };
  } catch (err) {
    return { error: 'Failed to fetch soil data' };
  }
}

  if (loading) {
    return (
      <div className="soil-widget">
        <div className="widget-header">
          <h3>🌱 Soil Health</h3>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing soil...</p>
        </div>
      </div>
    );
  }

  if (error && !soilData) {
    return (
      <div className="soil-widget">
        <div className="widget-header">
          <h3>🌱 Soil Health</h3>
          <button onClick={refreshSoilData} className="refresh-btn">🔄</button>
        </div>
        <div className="error">
          <p style={{ color: error.includes('API key') ? 'orange' : 'red', fontWeight: 600 }}>
            {error.includes('API key') ? (
              <>
                <span>⚠️ {error}</span><br />
                <span style={{ fontSize: '12px' }}>Go to your <a href="https://agromonitoring.com/dashboard" target="_blank" rel="noopener noreferrer">Agromonitoring dashboard</a> to activate or update your API key.</span>
              </>
            ) : error}
          </p>
          <button onClick={refreshSoilData} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  const soilType = getSoilType(soilData?.sand || 45, soilData?.clay || 25, soilData?.silt || 30);
  const soilColor = getSoilColor(soilData?.organicCarbon || 2.3);
  const healthEmoji = getSoilHealthEmoji(analysis?.overall || 'Good');
  // Always show crop recommendations based on the latest soil data for the selected or current location
  const cropRecommendations = soilData ? recommendCropsForSoil(soilData) : [];

  return (
    <div className="soil-widget">
      <div className="widget-header">
        <h3>{healthEmoji} Soil Health</h3>
        <button onClick={refreshSoilData} className="refresh-btn" title="Refresh">🔄</button>
      </div>

      {error && (
        <div className="warning">
          <small>{error}</small>
        </div>
      )}

      <div className="soil-overview">
        <div style={{ marginBottom: '8px' }}>
          {soilData?.error ? (
            <span style={{ fontWeight: 600, color: 'red' }}>
              {soilData.error}
            </span>
          ) : (
            <span style={{ fontWeight: 600, color: soilData?.isRealTime ? 'green' : 'orange' }}>
              {soilData?.isRealTime ? 'Real-time Data' : 'Sample Data'}
            </span>
          )}
        </div>
        {!soilData?.error && (
          <div className="soil-status">
            <div className="status-indicator" style={{ backgroundColor: soilColor }}>
              <span className="status-text">{analysis?.overall || 'Good'}</span>
            </div>
            <div className="soil-type">
              <strong>{soilType}</strong>
              <small>Soil Type</small>
            </div>
          </div>
        )}
        <div className="location-info">
          <small>📍 {locationProp ? `${locationProp} (${soilData?.location})` : soilData?.location || 'Unknown Location'}</small>
          <small>📏 Depth: {soilData?.depth || '0-30cm'}</small>
        </div>
      </div>

      <div className="soil-metrics">
        <div className="metric">
          <span className="metric-label">pH Level</span>
          <span className="metric-value">{soilData?.ph || 6.8}</span>
          <span className="metric-status">{analysis?.phStatus || 'Optimal'}</span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Nitrogen</span>
          <span className="metric-value">{soilData?.nitrogen || 85}</span>
          <span className="metric-unit">mg/kg</span>
        </div>
        
        <div className="metric">
          <span className="metric-label">Organic Carbon</span>
          <span className="metric-value">{soilData?.organicCarbon || 2.3}</span>
          <span className="metric-unit">%</span>
        </div>
        
        {soilData?.moisture && (
          <div className="metric">
            <span className="metric-label">Moisture</span>
            <span className="metric-value">{soilData.moisture}</span>
            <span className="metric-unit">%</span>
          </div>
        )}
      </div>


      <div className="soil-composition">
        <h4>Soil Composition</h4>
        <div className="composition-bars">
          <div className="composition-item">
            <span>Sand: {soilData?.sand ?? 45}%</span>
            <div className="progress-bar">
              <div 
                className="progress-fill sand" 
                style={{ width: `${soilData?.sand ?? 45}%` }}
              ></div>
            </div>
          </div>
          <div className="composition-item">
            <span>Clay: {soilData?.clay ?? 25}%</span>
            <div className="progress-bar">
              <div 
                className="progress-fill clay" 
                style={{ width: `${soilData?.clay ?? 25}%` }}
              ></div>
            </div>
          </div>
          <div className="composition-item">
            <span>Silt: {soilData?.silt ?? 30}%</span>
            <div className="progress-bar">
              <div 
                className="progress-fill silt" 
                style={{ width: `${soilData?.silt ?? 30}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {Array.isArray(analysis?.recommendations) && analysis.recommendations.length > 0 && (
        <div className="recommendations">
          <h4>💡 Recommendations</h4>
          <ul>
            {analysis.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(cropRecommendations) && cropRecommendations.length > 0 && (
        <div className="crop-recommendations">
          <h4>🌾 Suitable Crops for {locationProp || 'Your Soil'}</h4>
          <ul>
            {cropRecommendations.map((crop, idx) => (
              <li key={idx}>{crop}</li>
            ))}
          </ul>
        </div>
      )}

      {soilData?.lastUpdated && (
        <div className="last-updated">
          <small>Last updated: {soilData.lastUpdated}</small>
        </div>
      )}
    </div>
  );
};

export default SoilWidget;