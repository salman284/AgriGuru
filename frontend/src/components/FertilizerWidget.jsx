import React, { useState, useEffect } from 'react';
import { Zap, Leaf, Droplets, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import './FertilizerWidget.css';

const FertilizerWidget = ({ onClick }) => {
  const [fertilizerData, setFertilizerData] = useState({
    currentSoilNutrients: {
      nitrogen: 65,
      phosphorus: 42,
      potassium: 58,
      ph: 6.8
    },
    recommendedFertilizer: {
      name: "NPK 20-10-10",
      type: "Balanced Nitrogen Rich",
      application: "15kg per acre",
      nextApplication: "Oct 8, 2025"
    },
    efficiency: 87,
    costSavings: 1250,
    status: "optimal"
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getNutrientColor = (value) => {
    if (value >= 70) return '#10b981';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
  };

  if (isLoading) {
    return (
      <div className="fertilizer-widget loading" onClick={onClick}>
        <div className="widget-header">
          <div className="header-content">
            <h3>🌿 Organic Fertilizer</h3>
          </div>
          <div className="loading-pulse"></div>
        </div>
        <div className="fertilizer-content">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Analyzing soil nutrients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fertilizer-widget" onClick={onClick}>
      <div className="widget-header">
        <div className="header-content">
          <h3>🌿 Organic Fertilizer</h3>
        </div>
        <div className="status-badge" style={{ backgroundColor: getStatusColor(fertilizerData.status) }}>
          {fertilizerData.status.toUpperCase()}
        </div>
      </div>

      <div className="fertilizer-content">
        {/* Soil Nutrients */}
        <div className="nutrients-section">
          <h4><Leaf className="section-icon" />Soil Nutrients</h4>
          <div className="nutrients-grid">
            <div className="nutrient-item">
              <span className="nutrient-label">N</span>
              <div className="nutrient-bar">
                <div 
                  className="nutrient-fill" 
                  style={{ 
                    width: `${fertilizerData.currentSoilNutrients.nitrogen}%`,
                    backgroundColor: getNutrientColor(fertilizerData.currentSoilNutrients.nitrogen)
                  }}
                ></div>
              </div>
              <span className="nutrient-value">{fertilizerData.currentSoilNutrients.nitrogen}%</span>
            </div>
            
            <div className="nutrient-item">
              <span className="nutrient-label">P</span>
              <div className="nutrient-bar">
                <div 
                  className="nutrient-fill" 
                  style={{ 
                    width: `${fertilizerData.currentSoilNutrients.phosphorus}%`,
                    backgroundColor: getNutrientColor(fertilizerData.currentSoilNutrients.phosphorus)
                  }}
                ></div>
              </div>
              <span className="nutrient-value">{fertilizerData.currentSoilNutrients.phosphorus}%</span>
            </div>
            
            <div className="nutrient-item">
              <span className="nutrient-label">K</span>
              <div className="nutrient-bar">
                <div 
                  className="nutrient-fill" 
                  style={{ 
                    width: `${fertilizerData.currentSoilNutrients.potassium}%`,
                    backgroundColor: getNutrientColor(fertilizerData.currentSoilNutrients.potassium)
                  }}
                ></div>
              </div>
              <span className="nutrient-value">{fertilizerData.currentSoilNutrients.potassium}%</span>
            </div>
          </div>
        </div>

        {/* Soil-Based Recommendations */}
        <div className="fertilizer-recommendations-section">
          <h4>🎯 Recommended for Your Soil</h4>
          
          <div className="soil-condition">
            <div className="soil-info">
              <span className="soil-type">Clay Soil</span>
              <span className="soil-ph">pH 6.8</span>
            </div>
          </div>

          <div className="recommended-fertilizers">
            <div className="fertilizer-rec primary">
              <span className="fertilizer-emoji">🐄</span>
              <div className="fertilizer-info">
                <strong>Cow/Buffalo Dung Manure</strong>
                <p>Perfect for clay - improves drainage & structure</p>
              </div>
              <span className="priority">HIGH</span>
            </div>

            <div className="fertilizer-rec primary">
              <span className="fertilizer-emoji">🌿</span>
              <div className="fertilizer-info">
                <strong>Compost</strong>
                <p>Breaks clay particles, adds organic matter</p>
              </div>
              <span className="priority">HIGH</span>
            </div>

            <div className="fertilizer-rec secondary">
              <span className="fertilizer-emoji">🐓</span>
              <div className="fertilizer-info">
                <strong>Poultry Manure</strong>
                <p>For low nitrogen - high N & P content</p>
              </div>
              <span className="priority">MED</span>
            </div>

            <div className="fertilizer-rec secondary">
              <span className="fertilizer-emoji">🦴</span>
              <div className="fertilizer-info">
                <strong>Bone Meal</strong>
                <p>Root development - high phosphorus</p>
              </div>
              <span className="priority">MED</span>
            </div>
          </div>

          <div className="application-guide">
            <h5>📅 Application Schedule</h5>
            <div className="schedule-items">
              <div className="schedule-item">
                <span className="timing">Pre-Season:</span>
                <span className="action">Compost & manure (2-3 weeks before)</span>
              </div>
              <div className="schedule-item">
                <span className="timing">Growing:</span>
                <span className="action">Fish emulsion every 2-3 weeks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="metrics-section">
          <div className="metric-item">
            <div className="metric-value">{fertilizerData.efficiency}%</div>
            <div className="metric-label">Efficiency</div>
          </div>
          <div className="metric-item">
            <div className="metric-value">₹{fertilizerData.costSavings}</div>
            <div className="metric-label">Savings</div>
          </div>
        </div>
      </div>

      <div className="widget-footer">
        <div className="footer-info">
          <AlertCircle className="info-icon" />
          <span>Based on latest soil analysis</span>
        </div>
      </div>
    </div>
  );
};

export default FertilizerWidget;