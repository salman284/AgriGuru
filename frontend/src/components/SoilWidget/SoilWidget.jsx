import React, { useState, useEffect } from 'react';
import { analyzeSoilHealth, getSoilType, getSoilColor, getSoilHealthEmoji } from '../../services/soilService';
import { getCropRecommendationsFromCSV } from '../../services/cropRecommendationService';
import './SoilWidget.css';


const SoilWidget = ({ location: locationProp }) => {
  const [soilData, setSoilData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [cropRecommendations, setCropRecommendations] = useState([]);

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

  // Fetch crop recommendations from CSV when soil data changes
  useEffect(() => {
    const fetchCropRecommendations = async () => {
      if (soilData && !soilData.error) {
        try {
          const recommendations = await getCropRecommendationsFromCSV(soilData);
          setCropRecommendations(recommendations);
        } catch (error) {
          console.error('Error fetching crop recommendations:', error);
          setCropRecommendations([]);
        }
      } else {
        setCropRecommendations([]);
      }
    };
    
    fetchCropRecommendations();
  }, [soilData]);

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
  
  // Generate location-based soil variation for better demonstration
  const generateLocationBasedSoil = (lat, lon) => {
    // Use lat/lon to create consistent but varying soil data
    const latFactor = Math.abs(lat % 10) / 10;
    const lonFactor = Math.abs(lon % 10) / 10;
    
    // Different soil types based on location
    const soilVariations = [
      // Sandy soil (Gujarat, Rajasthan region)
      {
        sand: 65 + Math.floor(latFactor * 20),
        clay: 15 + Math.floor(lonFactor * 10),
        silt: 20 + Math.floor((latFactor + lonFactor) * 5),
        ph: 7.2 + (latFactor - 0.5) * 1.5,
        nitrogen: 40 + Math.floor(lonFactor * 40),
        organicCarbon: 0.8 + latFactor * 1.2
      },
      // Clay soil (Bengal, Odisha region)
      {
        sand: 20 + Math.floor(latFactor * 15),
        clay: 45 + Math.floor(lonFactor * 20),
        silt: 35 + Math.floor((latFactor + lonFactor) * 5),
        ph: 6.0 + (lonFactor - 0.3) * 1.0,
        nitrogen: 70 + Math.floor(latFactor * 50),
        organicCarbon: 2.0 + lonFactor * 1.5
      },
      // Loamy soil (Punjab, Haryana region)
      {
        sand: 40 + Math.floor(latFactor * 20),
        clay: 25 + Math.floor(lonFactor * 15),
        silt: 35 + Math.floor((latFactor + lonFactor) * 5),
        ph: 7.0 + (latFactor - 0.4) * 1.0,
        nitrogen: 80 + Math.floor(lonFactor * 40),
        organicCarbon: 2.5 + latFactor * 1.0
      },
      // Red soil (South India region)
      {
        sand: 50 + Math.floor(latFactor * 25),
        clay: 30 + Math.floor(lonFactor * 15),
        silt: 20 + Math.floor((latFactor + lonFactor) * 5),
        ph: 5.8 + (lonFactor - 0.2) * 1.5,
        nitrogen: 50 + Math.floor(latFactor * 60),
        organicCarbon: 1.5 + lonFactor * 1.8
      }
    ];
    
    // Select soil type based on location
    const index = Math.floor((lat + lon) * 10) % soilVariations.length;
    return soilVariations[index];
  };
  
  try {
    const response = await fetch(url);
    if (response.status === 401) {
      // Use location-based soil data when API fails
      const locationSoil = generateLocationBasedSoil(lat, lon);
      return {
        ...locationSoil,
        location: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        depth: '0-30cm',
        isRealTime: false,
        lastUpdated: new Date().toLocaleString(),
        error: 'API key is not active. Showing location-based sample data.'
      };
    }
    if (!response.ok) {
      const locationSoil = generateLocationBasedSoil(lat, lon);
      return {
        ...locationSoil,
        location: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        depth: '0-30cm',
        isRealTime: false,
        lastUpdated: new Date().toLocaleString(),
        error: `API error: ${response.status}. Showing location-based sample data.`
      };
    }
    const result = await response.json();
    
    // Use real API data if available, otherwise location-based data
    if (result && typeof result === 'object') {
      return {
        sand: typeof result.sand === 'number' ? result.sand : generateLocationBasedSoil(lat, lon).sand,
        clay: typeof result.clay === 'number' ? result.clay : generateLocationBasedSoil(lat, lon).clay,
        silt: typeof result.silt === 'number' ? result.silt : generateLocationBasedSoil(lat, lon).silt,
        ph: typeof result.ph === 'number' ? result.ph : generateLocationBasedSoil(lat, lon).ph,
        nitrogen: typeof result.n === 'number' ? result.n : generateLocationBasedSoil(lat, lon).nitrogen,
        organicCarbon: typeof result.oc === 'number' ? result.oc : generateLocationBasedSoil(lat, lon).organicCarbon,
        moisture: typeof result.moisture === 'number' ? result.moisture : undefined,
        location: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        depth: result.depth || '0-30cm',
        isRealTime: true,
        lastUpdated: new Date().toLocaleString(),
        data: result
      };
    } else {
      const locationSoil = generateLocationBasedSoil(lat, lon);
      return {
        ...locationSoil,
        location: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
        depth: '0-30cm',
        isRealTime: false,
        lastUpdated: new Date().toLocaleString()
      };
    }
  } catch (err) {
    // Generate location-based data on error
    const locationSoil = generateLocationBasedSoil(lat, lon);
    return {
      ...locationSoil,
      location: `${lat.toFixed(3)}, ${lon.toFixed(3)}`,
      depth: '0-30cm',
      isRealTime: false,
      lastUpdated: new Date().toLocaleString(),
      error: 'Failed to fetch soil data. Showing location-based sample data.'
    };
  }
}

  if (loading) {
    return (
      <div className="soil-widget loading">
        <div className="loading-header">
          <h3>🌱 Soil Health</h3>
          <div className="loading-pulse"></div>
        </div>
        <div className="loading-content">
          <div className="skeleton-soil-card">
            <div className="skeleton-soil-circle"></div>
            <div className="skeleton-soil-info">
              <div className="skeleton-line soil-long"></div>
              <div className="skeleton-line soil-medium"></div>
            </div>
          </div>
          <div className="skeleton-metrics">
            <div className="skeleton-metric">
              <div className="skeleton-line soil-short"></div>
              <div className="skeleton-line soil-tiny"></div>
            </div>
            <div className="skeleton-metric">
              <div className="skeleton-line soil-short"></div>
              <div className="skeleton-line soil-tiny"></div>
            </div>
            <div className="skeleton-metric">
              <div className="skeleton-line soil-short"></div>
              <div className="skeleton-line soil-tiny"></div>
            </div>
          </div>
          <div className="loading-text">
            <span className="analyzing-text">Analyzing soil composition</span>
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
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
          <div className="crop-list">
            {cropRecommendations.slice(0, 6).map((crop, idx) => (
              <div key={idx} className="crop-item">
                <div className="crop-header">
                  <span className="crop-name">{crop.crop_name}</span>
                  <span className="crop-season">{crop.season}</span>
                </div>
                <div className="crop-details">
                  <small>🌡️ {crop.temperature_range}°C</small>
                  <small>💧 {crop.water_requirement}mm</small>
                  <small>⏱️ {crop.growth_duration_days} days</small>
                  <small>📈 {crop.yield_potential_tons_per_hectare} t/ha</small>
                </div>
                {crop.fertilizer_requirements && (
                  <div className="crop-fertilizer">
                    <small>🌱 {crop.fertilizer_requirements}</small>
                  </div>
                )}
              </div>
            ))}
          </div>
          {cropRecommendations.length > 6 && (
            <div className="more-crops">
              <small>+{cropRecommendations.length - 6} more crops suitable for your soil</small>
            </div>
          )}
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