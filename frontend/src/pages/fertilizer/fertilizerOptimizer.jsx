import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Leaf, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  MapPin,
  Settings
} from 'lucide-react';
import './fertilizerOptimizer.css';

const FertilizerOptimizer = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [soilData, setSoilData] = useState({
    nitrogen: 65,
    phosphorus: 42,
    potassium: 58,
    ph: 6.8,
    organicMatter: 3.2,
    sulfur: 25,
    calcium: 78,
    magnesium: 45
  });

  const [recommendations, setRecommendations] = useState([
    {
      id: 1,
      fertilizer: "NPK 20-10-10",
      type: "Nitrogen Rich",
      application: "15 kg/acre",
      cost: "₹1,200",
      timing: "Oct 8, 2025",
      priority: "high",
      benefits: ["Boost nitrogen levels", "Support vegetative growth", "Improve leaf color"]
    },
    {
      id: 2,
      fertilizer: "Single Super Phosphate",
      type: "Phosphorus Supplement",
      application: "8 kg/acre",
      cost: "₹800",
      timing: "Oct 15, 2025",
      priority: "medium",
      benefits: ["Enhance root development", "Improve flowering", "Increase fruit set"]
    },
    {
      id: 3,
      fertilizer: "Muriate of Potash",
      type: "Potassium Booster",
      application: "10 kg/acre",
      cost: "₹950",
      timing: "Oct 22, 2025",
      priority: "medium",
      benefits: ["Improve disease resistance", "Enhance fruit quality", "Water regulation"]
    }
  ]);

  const [applicationHistory, setApplicationHistory] = useState([
    {
      date: "Sep 25, 2025",
      fertilizer: "Urea",
      amount: "12 kg/acre",
      cost: "₹720",
      status: "completed",
      efficiency: 88
    },
    {
      date: "Sep 10, 2025",
      fertilizer: "DAP",
      amount: "10 kg/acre",
      cost: "₹1,100",
      status: "completed",
      efficiency: 92
    },
    {
      date: "Aug 28, 2025",
      fertilizer: "Complex 19-19-19",
      amount: "8 kg/acre",
      cost: "₹950",
      status: "completed",
      efficiency: 85
    }
  ]);

  const [analytics, setAnalytics] = useState({
    totalSpent: 15750,
    savings: 3200,
    efficiency: 87,
    yieldIncrease: 15,
    nutrientBalance: 78,
    environmentalImpact: 92
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getNutrientColor = (value) => {
    if (value >= 70) return '#10b981';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const renderDashboard = () => (
    <div className="fertilizer-dashboard">
      {/* Soil Nutrient Status */}
      <div className="dashboard-section">
        <h3><Leaf className="section-icon" />Current Soil Status</h3>
        <div className="nutrients-overview">
          {Object.entries(soilData).map(([nutrient, value]) => (
            <div key={nutrient} className="nutrient-card">
              <div className="nutrient-header">
                <span className="nutrient-name">{nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}</span>
                <span className="nutrient-value" style={{ color: getNutrientColor(value) }}>
                  {typeof value === 'number' ? `${value}${nutrient === 'ph' ? '' : '%'}` : value}
                </span>
              </div>
              <div className="nutrient-bar">
                <div 
                  className="nutrient-progress" 
                  style={{ 
                    width: `${typeof value === 'number' ? Math.min(value, 100) : 50}%`,
                    backgroundColor: getNutrientColor(value)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Analytics */}
      <div className="dashboard-section">
        <h3><BarChart3 className="section-icon" />Performance Metrics</h3>
        <div className="analytics-grid">
          <div className="analytic-card">
            <div className="analytic-icon">
              <DollarSign />
            </div>
            <div className="analytic-content">
              <div className="analytic-value">₹{analytics.totalSpent.toLocaleString()}</div>
              <div className="analytic-label">Total Investment</div>
            </div>
          </div>
          
          <div className="analytic-card">
            <div className="analytic-icon savings">
              <TrendingUp />
            </div>
            <div className="analytic-content">
              <div className="analytic-value">₹{analytics.savings.toLocaleString()}</div>
              <div className="analytic-label">Cost Savings</div>
            </div>
          </div>
          
          <div className="analytic-card">
            <div className="analytic-icon efficiency">
              <Target />
            </div>
            <div className="analytic-content">
              <div className="analytic-value">{analytics.efficiency}%</div>
              <div className="analytic-label">Efficiency</div>
            </div>
          </div>
          
          <div className="analytic-card">
            <div className="analytic-icon yield">
              <BarChart3 />
            </div>
            <div className="analytic-content">
              <div className="analytic-value">+{analytics.yieldIncrease}%</div>
              <div className="analytic-label">Yield Increase</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="dashboard-section">
        <h3><Zap className="section-icon" />Priority Recommendations</h3>
        <div className="recommendations-preview">
          {recommendations.slice(0, 2).map((rec) => (
            <div key={rec.id} className="recommendation-card">
              <div className="rec-header">
                <div className="rec-title">{rec.fertilizer}</div>
                <div 
                  className="priority-badge" 
                  style={{ backgroundColor: getPriorityColor(rec.priority) }}
                >
                  {rec.priority.toUpperCase()}
                </div>
              </div>
              <div className="rec-details">
                <div className="rec-info">
                  <Droplets className="info-icon" />
                  <span>{rec.application}</span>
                </div>
                <div className="rec-info">
                  <Calendar className="info-icon" />
                  <span>{rec.timing}</span>
                </div>
                <div className="rec-info">
                  <DollarSign className="info-icon" />
                  <span>{rec.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="recommendations-full">
      <div className="recommendations-header">
        <h3>AI-Powered Fertilizer Recommendations</h3>
        <p>Based on current soil analysis and crop requirements</p>
      </div>
      
      <div className="recommendations-list">
        {recommendations.map((rec) => (
          <div key={rec.id} className="recommendation-detail-card">
            <div className="rec-main-info">
              <div className="rec-left">
                <div className="rec-name">{rec.fertilizer}</div>
                <div className="rec-type">{rec.type}</div>
                <div 
                  className="priority-indicator" 
                  style={{ backgroundColor: getPriorityColor(rec.priority) }}
                >
                  {rec.priority.toUpperCase()} PRIORITY
                </div>
              </div>
              
              <div className="rec-right">
                <div className="rec-metrics">
                  <div className="metric">
                    <Droplets className="metric-icon" />
                    <span>{rec.application}</span>
                  </div>
                  <div className="metric">
                    <Calendar className="metric-icon" />
                    <span>{rec.timing}</span>
                  </div>
                  <div className="metric">
                    <DollarSign className="metric-icon" />
                    <span>{rec.cost}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="rec-benefits">
              <h4>Expected Benefits:</h4>
              <div className="benefits-list">
                {rec.benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <CheckCircle className="benefit-icon" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rec-actions">
              <button className="action-btn primary">Schedule Application</button>
              <button className="action-btn secondary">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="application-history">
      <div className="history-header">
        <h3>Application History</h3>
        <p>Track your fertilizer applications and their effectiveness</p>
      </div>
      
      <div className="history-list">
        {applicationHistory.map((app, index) => (
          <div key={index} className="history-item">
            <div className="history-date">
              <Calendar className="date-icon" />
              <span>{app.date}</span>
            </div>
            
            <div className="history-details">
              <div className="history-main">
                <div className="fertilizer-name">{app.fertilizer}</div>
                <div className="application-amount">{app.amount}</div>
              </div>
              
              <div className="history-metrics">
                <div className="history-cost">{app.cost}</div>
                <div className="efficiency-score">
                  <Target className="efficiency-icon" />
                  {app.efficiency}% Efficiency
                </div>
              </div>
            </div>
            
            <div className="history-status">
              <CheckCircle className="status-icon completed" />
              <span>Completed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="fertilizer-analytics">
      <div className="analytics-header">
        <h3>Fertilizer Analytics & Insights</h3>
        <p>Comprehensive analysis of your fertilization program</p>
      </div>
      
      <div className="analytics-full-grid">
        <div className="analytics-card large">
          <h4><BarChart3 className="card-icon" />Cost Analysis</h4>
          <div className="cost-breakdown">
            <div className="cost-item">
              <span>Total Investment</span>
              <span className="cost-value">₹{analytics.totalSpent.toLocaleString()}</span>
            </div>
            <div className="cost-item savings">
              <span>Cost Savings</span>
              <span className="cost-value">₹{analytics.savings.toLocaleString()}</span>
            </div>
            <div className="cost-item">
              <span>ROI</span>
              <span className="cost-value">{Math.round((analytics.savings / analytics.totalSpent) * 100)}%</span>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <h4><Target className="card-icon" />Efficiency Score</h4>
          <div className="efficiency-circle">
            <div className="circle-progress">
              <span className="efficiency-value">{analytics.efficiency}%</span>
            </div>
          </div>
        </div>
        
        <div className="analytics-card">
          <h4><TrendingUp className="card-icon" />Yield Impact</h4>
          <div className="yield-metrics">
            <div className="yield-increase">+{analytics.yieldIncrease}%</div>
            <div className="yield-label">Yield Increase</div>
          </div>
        </div>
        
        <div className="analytics-card">
          <h4><Leaf className="card-icon" />Nutrient Balance</h4>
          <div className="balance-score">
            <div className="balance-value">{analytics.nutrientBalance}%</div>
            <div className="balance-label">Balanced</div>
          </div>
        </div>
        
        <div className="analytics-card large">
          <h4><MapPin className="card-icon" />Environmental Impact</h4>
          <div className="environmental-metrics">
            <div className="env-item">
              <span>Sustainability Score</span>
              <span className="env-value">{analytics.environmentalImpact}%</span>
            </div>
            <div className="env-item">
              <span>Carbon Footprint</span>
              <span className="env-value">-12% Reduced</span>
            </div>
            <div className="env-item">
              <span>Soil Health Index</span>
              <span className="env-value">8.5/10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fertilizer-optimizer-modal">
      <div className="modal-header">
        <h2><Zap className="modal-icon" />Fertilizer Optimizer</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="modal-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 className="tab-icon" />
          Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Zap className="tab-icon" />
          Recommendations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock className="tab-icon" />
          History
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 className="tab-icon" />
          Analytics
        </button>
      </div>
      
      <div className="modal-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'recommendations' && renderRecommendations()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default FertilizerOptimizer;