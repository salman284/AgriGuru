import React, { useEffect, useState } from 'react';
import fertilizerService from '../../services/fertilizerService';

const OrganicFertilizersList = () => {
  const [fertilizers, setFertilizers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiSource, setApiSource] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const fetchFertilizers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching location-based fertilizer data from real APIs...');
      const data = await fertilizerService.getFertilizers();
      
      setFertilizers(data);
      setLastUpdated(new Date().toLocaleTimeString());
      
      // Get location info for display
      if (fertilizerService.userLocation) {
        setUserLocation(fertilizerService.userLocation);
        setApiSource(`Location-Based (${fertilizerService.userLocation.city || 'Unknown'})`);
      } else {
        setApiSource(data.length > 1 ? 'Real API' : 'Fallback Data');
      }
      
      console.log(`Successfully loaded ${data.length} fertilizers for your location`);
      
    } catch (error) {
      console.error('Error fetching fertilizers:', error);
      setError(`No real-time data available: ${error.message}`);
      setFertilizers([]); // Show empty state instead of fallback data
      setApiSource('No API Connection');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFertilizers(); // Initial fetch
    const interval = setInterval(fetchFertilizers, 30000); // Refresh every 30 seconds

    // Listen for location changes
    const handleLocationChange = (event) => {
      console.log('Location changed, updating fertilizer recommendations...');
      setUserLocation(event.detail.location);
      fetchFertilizers(); // Refresh data when location changes
    };

    window.addEventListener('locationChanged', handleLocationChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('locationChanged', handleLocationChange);
      // Stop location monitoring when component unmounts
      if (fertilizerService.stopLocationWatch) {
        fertilizerService.stopLocationWatch();
      }
    };
  }, []);

  return (
    <div className="fertilizer-dashboard">
      <div className="dashboard-header">
        <h2>🌿 Organic Fertilizers Dashboard</h2>
        <div className="update-info">
          <span className="update-indicator">🔄</span>
          <span>Last updated: {lastUpdated || 'Loading...'}</span>
          {apiSource && (
            <span className="api-source"> | Source: {apiSource}</span>
          )}
          {userLocation && (
            <span className="location-info"> | 📍 {userLocation.city}, {userLocation.state}</span>
          )}
          {userLocation?.method && (
            <span className="location-method"> | Via {userLocation.method.toUpperCase()}</span>
          )}
          {isLoading && (
            <span className="loading-indicator"> | Loading...</span>
          )}
          {error && (
            <span className="error-indicator"> | Error: {error}</span>
          )}
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>{fertilizers.length}</h3>
          <p>Available Fertilizers</p>
        </div>
        <div className="stat-card">
          <h3>{fertilizers.filter(f => f.nutrients?.availability === 'In Stock').length}</h3>
          <p>In Stock</p>
        </div>
        <div className="stat-card">
          <h3>{fertilizers.filter(f => f.type?.toLowerCase().includes('liquid')).length}</h3>
          <p>Liquid Options</p>
        </div>
        <div className="stat-card">
          <h3>{fertilizers.filter(f => f.type?.toLowerCase().includes('organic')).length}</h3>
          <p>Organic Types</p>
        </div>
      </div>

      <div className="table-container">
        <table className="fertilizer-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Key Benefits</th>
              <th>NPK Content</th>
              <th>Application Method</th>
              <th>Best For</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fertilizers.length === 0 && !isLoading ? (
              <tr>
                <td colSpan="6" className="no-data-message">
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    <h3>🔌 No Real-Time Data Available</h3>
                    <p>To show fertilizer data, please configure API keys:</p>
                    <div style={{ marginTop: '1rem', fontSize: '0.9em' }}>
                      <strong>Required Environment Variables:</strong><br/>
                      <code>REACT_APP_FERTILIZER_API_KEY</code><br/>
                      <code>REACT_APP_FERTILIZER_API_URL</code>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.9em' }}>
                      Add these to your <code>.env</code> file with real API credentials
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              fertilizers.map((f, index) => (
                <tr key={index} className="fertilizer-row">
                <td className="fertilizer-name">
                  <strong>{f.fertilizer_name}</strong>
                </td>
                <td className="fertilizer-type">{f.type}</td>
                <td className="benefits-cell">
                  <ul className="benefits-list">
                    {f.benefits.slice(0, 2).map((benefit, i) => (
                      <li key={i}>{benefit}</li>
                    ))}
                  </ul>
                </td>
                <td className="nutrients-cell">
                  <div className="npk-breakdown">
                    <span className="nutrient">N: {f.nutrients?.Nitrogen || '-'}</span>
                    <span className="nutrient">P: {f.nutrients?.Phosphorus || '-'}</span>
                    <span className="nutrient">K: {f.nutrients?.Potassium || '-'}</span>
                  </div>
                </td>
                <td className="application-cell">{f.application_method}</td>
                <td className="crops-cell">
                  <div className="crop-tags">
                    {f.compatible_crops?.slice(0, 3).map((crop, i) => (
                      <span key={i} className="crop-tag">{crop}</span>
                    ))}
                  </div>
                </td>
                <td className="status-cell">
                  <span className={`status-badge ${f.nutrients?.availability?.toLowerCase().replace(' ', '-')}`}>
                    {f.nutrients?.availability || 'Available'}
                  </span>
                  <span className={`trend-badge ${f.nutrients?.price_trend?.toLowerCase()}`}>
                    {f.nutrients?.price_trend || 'Stable'}
                  </span>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .fertilizer-dashboard {
          background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
          border-radius: 20px;
          padding: 25px;
          margin: 20px 0;
          color: white;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .fertilizer-dashboard::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
          pointer-events: none;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 1;
        }

        .dashboard-header h2 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .update-info {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 15px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          flex-wrap: wrap;
          font-size: 0.85rem;
        }

        .api-source {
          color: #90EE90;
          font-weight: bold;
        }

        .loading-indicator {
          color: #FFD700;
          font-weight: bold;
        }

        .location-info {
          color: #87CEEB;
          font-weight: bold;
        }

        .update-indicator {
          animation: rotate 2s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .stats-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.2);
        }

        .stat-card h3 {
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: bold;
          color: #90EE90;
        }

        .stat-card p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .table-container {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
          backdrop-filter: blur(10px);
          overflow-x: auto;
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .fertilizer-table {
          width: 100%;
          border-collapse: collapse;
          background: transparent;
        }

        .fertilizer-table th {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 15px 12px;
          text-align: left;
          font-weight: 700;
          border-bottom: 2px solid rgba(255, 255, 255, 0.3);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .fertilizer-table td {
          padding: 15px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          vertical-align: top;
        }

        .fertilizer-row {
          transition: background-color 0.3s ease;
        }

        .fertilizer-row:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .fertilizer-name strong {
          color: #90EE90;
          font-size: 1.1rem;
        }

        .fertilizer-type {
          font-style: italic;
          opacity: 0.9;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .benefits-list li {
          background: rgba(255, 255, 255, 0.1);
          padding: 4px 8px;
          margin-bottom: 4px;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .benefits-list li:before {
          content: "✓ ";
          color: #90EE90;
          font-weight: bold;
        }

        .npk-breakdown {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nutrient {
          background: rgba(255, 255, 255, 0.2);
          padding: 3px 8px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: bold;
        }

        .application-cell {
          font-size: 0.9rem;
          line-height: 1.4;
          max-width: 200px;
        }

        .crop-tags {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .crop-tag {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 10px;
          font-size: 0.8rem;
          text-align: center;
        }

        .status-cell {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-badge, .trend-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
          text-align: center;
        }

        .status-badge.in-stock {
          background: #28a745;
          color: white;
        }

        .status-badge.limited-stock {
          background: #ffc107;
          color: #333;
        }

        .status-badge.available {
          background: #17a2b8;
          color: white;
        }

        .trend-badge.stable {
          background: #28a745;
          color: white;
        }

        .trend-badge.rising {
          background: #dc3545;
          color: white;
        }

        .trend-badge.falling {
          background: #6f42c1;
          color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .fertilizer-dashboard {
            padding: 20px;
            margin: 15px 0;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .stats-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .fertilizer-table {
            font-size: 0.8rem;
          }

          .fertilizer-table th,
          .fertilizer-table td {
            padding: 10px 8px;
          }
        }

        @media (max-width: 480px) {
          .stats-summary {
            grid-template-columns: 1fr;
          }

          .fertilizer-table th,
          .fertilizer-table td {
            padding: 8px 6px;
          }

          .dashboard-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrganicFertilizersList;