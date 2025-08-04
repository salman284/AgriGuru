import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './contact.css';

const ContactPage = () => {
  const { t } = useTranslation('common');
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyADOs, setNearbyADOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // Sample ADO data (In a real app, this would come from an API)
  const adoData = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      designation: "Agricultural Development Officer",
      district: "Central District",
      office: "District Agricultural Office",
      phone: "+91-9876543210",
      email: "rajesh.kumar@agri.gov.in",
      address: "Block A, Agricultural Complex, Sector 10",
      specialization: "Crop Disease Management, Soil Health"
    },
    {
      id: 2,
      name: "Dr. Priya Singh",
      designation: "Senior ADO",
      district: "Eastern District",
      office: "Regional Agricultural Center",
      phone: "+91-9876543211",
      email: "priya.singh@agri.gov.in",
      address: "Agricultural Extension Center, Near City Park",
      specialization: "Organic Farming, Sustainable Agriculture"
    },
    {
      id: 3,
      name: "Mr. Amit Patel",
      designation: "ADO",
      district: "Western District",
      office: "Agricultural Support Office",
      phone: "+91-9876543212",
      email: "amit.patel@agri.gov.in",
      address: "Krishi Bhavan, Market Road",
      specialization: "Modern Farming Techniques, Irrigation"
    }
  ];

  // Equipment data structure
  const equipmentData = [
    {
      id: 1,
      name: "Tractor Usage",
      icon: "🚜",
      purpose: "Land preparation, plowing, seeding, and harvesting",
      steps: [
        "Check fuel, oil, and hydraulic fluid levels before starting",
        "Ensure proper attachment of implements (plow, harrow, etc.)",
        "Start engine and let it warm up for 5-10 minutes",
        "Adjust speed according to soil conditions (2-5 km/h for plowing)",
        "Maintain straight furrows with consistent depth",
        "Clean equipment after use to prevent rust"
      ],
      safetyTips: "Always wear protective gear, check brakes before operation, and never leave running tractor unattended."
    },
    {
      id: 2,
      name: "Combine Harvester",
      icon: "🌾",
      purpose: "Cutting, threshing, and cleaning grain crops",
      steps: [
        "Check crop moisture content (optimal: 18-22%)",
        "Adjust cutting height according to crop type",
        "Set threshing speed based on grain type",
        "Monitor grain tank and unload when 80% full",
        "Clean sieves and filters regularly during operation",
        "Maintain consistent forward speed (4-6 km/h)"
      ],
      safetyTips: "Keep hands away from moving parts, use proper lighting for night operations, and check fire extinguisher."
    },
    {
      id: 3,
      name: "Irrigation Systems",
      icon: "💧",
      purpose: "Efficient water distribution for crop irrigation",
      steps: [
        "Check water pressure and flow rate",
        "Clean filters and nozzles before operation",
        "Set timer for appropriate irrigation duration",
        "Monitor soil moisture levels regularly",
        "Adjust sprinkler heads for uniform coverage",
        "Drain system in winter to prevent freezing"
      ],
      safetyTips: "Check electrical connections, avoid over-watering, and maintain proper water quality standards."
    },
    {
      id: 4,
      name: "Seed Drill",
      icon: "🌱",
      purpose: "Precise seed placement and fertilizer application",
      steps: [
        "Calibrate seed rate according to crop requirements",
        "Fill seed and fertilizer hoppers properly",
        "Set appropriate seeding depth (1-3 cm for most crops)",
        "Maintain uniform forward speed (6-8 km/h)",
        "Check for blockages in tubes regularly",
        "Clean and store in dry place after use"
      ],
      safetyTips: "Wear dust masks when handling seeds, check for sharp edges, and ensure proper ventilation."
    },
    {
      id: 5,
      name: "Sprayer Equipment",
      icon: "💨",
      purpose: "Application of pesticides, herbicides, and fertilizers",
      steps: [
        "Calibrate spray rate and pressure settings",
        "Check nozzles for even spray pattern",
        "Mix chemicals according to label instructions",
        "Spray during calm weather conditions",
        "Maintain consistent boom height (50-60 cm)",
        "Clean tank thoroughly after each use"
      ],
      safetyTips: "Wear protective clothing and respirator, avoid spraying in windy conditions, and store chemicals safely."
    },
    {
      id: 6,
      name: "Threshing Machine",
      icon: "⚡",
      purpose: "Separating grains from stalks and chaff",
      steps: [
        "Ensure crop is properly dried (12-14% moisture)",
        "Check belt tension and alignment",
        "Feed crop material gradually and evenly",
        "Adjust fan speed for proper cleaning",
        "Monitor grain quality during operation",
        "Oil all moving parts regularly"
      ],
      safetyTips: "Keep guards in place, avoid loose clothing, and maintain safe distance from moving parts."
    },
    {
      id: 7,
      name: "Cultivator",
      icon: "🔧",
      purpose: "Soil preparation and weed control",
      steps: [
        "Adjust working depth (5-15 cm depending on crop)",
        "Check soil moisture - avoid working wet soil",
        "Maintain uniform speed (8-12 km/h)",
        "Overlap passes by 10-15 cm",
        "Replace worn tines and shovels regularly",
        "Clean soil buildup after each use"
      ],
      safetyTips: "Check for underground utilities, maintain proper hitching, and inspect for loose bolts before use."
    },
    {
      id: 8,
      name: "Rotary Tiller",
      icon: "🌿",
      purpose: "Breaking and mixing soil for seedbed preparation",
      steps: [
        "Set appropriate working depth (8-12 cm)",
        "Check soil conditions - avoid overly wet soil",
        "Maintain PTO speed at 540 RPM",
        "Work at steady speed (4-6 km/h)",
        "Inspect and replace worn tines",
        "Grease all fittings after every 10 hours"
      ],
      safetyTips: "Use proper PTO guards, avoid rocky areas, and never attempt to clear blockages while running."
    }
  ];

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // In a real app, we would use these coordinates to fetch nearby ADOs
          // For now, we'll just show all ADOs
          setNearbyADOs(adoData);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setNearbyADOs(adoData);
          setLoading(false);
        }
      );
    } else {
      console.log("Geolocation not supported");
      setNearbyADOs(adoData);
      setLoading(false);
    }
  }, []);

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Left Sidebar - Equipment List */}
        <div className="equipment-sidebar">
          <div className="sidebar-header">
            <h2>🚜 Farming Equipment</h2>
            <p>Click on equipment to see usage guidelines</p>
          </div>
          
          <div className="equipment-list">
            {equipmentData.map((equipment) => (
              <div 
                key={equipment.id} 
                className={`equipment-item ${selectedEquipment?.id === equipment.id ? 'active' : ''}`}
                onClick={() => setSelectedEquipment(equipment)}
              >
                <div className="equipment-icon">{equipment.icon}</div>
                <div className="equipment-info">
                  <h3>{equipment.name}</h3>
                  <p>{equipment.purpose}</p>
                </div>
                <div className="expand-icon">
                  {selectedEquipment?.id === equipment.id ? '▼' : '▶'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area - Equipment Details */}
        <div className="main-content">
          {selectedEquipment ? (
            <div className="equipment-details-view">
              <div className="equipment-header">
                <div className="equipment-title">
                  <span className="equipment-large-icon">{selectedEquipment.icon}</span>
                  <div>
                    <h1>{selectedEquipment.name}</h1>
                    <p className="equipment-purpose">{selectedEquipment.purpose}</p>
                  </div>
                </div>
              </div>

              <div className="equipment-content">
                <div className="usage-section">
                  <h3>📋 How to Use:</h3>
                  <ol className="usage-steps-list">
                    {selectedEquipment.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="safety-section">
                  <h3>⚠️ Safety Tips:</h3>
                  <div className="safety-content">
                    <p>{selectedEquipment.safetyTips}</p>
                  </div>
                </div>

                <div className="maintenance-quick-tips">
                  <h3>🔧 Quick Maintenance Tips:</h3>
                  <div className="maintenance-grid">
                    <div className="maintenance-tip">
                      <h4>Daily Check</h4>
                      <p>Inspect fluid levels and clean equipment after use</p>
                    </div>
                    <div className="maintenance-tip">
                      <h4>Weekly Check</h4>
                      <p>Lubricate moving parts and check for wear</p>
                    </div>
                    <div className="maintenance-tip">
                      <h4>Monthly Check</h4>
                      <p>Replace filters and inspect belts/chains</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="equipment-welcome">
              <div className="welcome-content">
                <h1>🚜 Farming Equipment Guidelines</h1>
                <p>Select an equipment from the left sidebar to view detailed usage instructions, safety tips, and maintenance guidelines.</p>
                <div className="welcome-features">
                  <div className="feature-item">
                    <span className="feature-icon">📋</span>
                    <h3>Step-by-step Instructions</h3>
                    <p>Detailed operating procedures for each equipment</p>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚠️</span>
                    <h3>Safety Guidelines</h3>
                    <p>Important safety measures and precautions</p>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔧</span>
                    <h3>Maintenance Tips</h3>
                    <p>Regular maintenance schedules and best practices</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Contact Details */}
        <div className="contact-sidebar">
          <div className="sidebar-header">
            <h2>👥 Agricultural Development Officers</h2>
            <p>Get expert farming assistance</p>
          </div>
          
          {loading ? (
            <div className="sidebar-loading">
              <div className="loading-spinner"></div>
              <p>{t('contact.loading')}</p>
            </div>
          ) : (
            <div className="ado-list">
              {nearbyADOs.map((ado) => (
                <div key={ado.id} className="ado-card">
                  <div className="ado-header">
                    <h3>{ado.name}</h3>
                    <span className="designation">{ado.designation}</span>
                  </div>
                  
                  <div className="ado-details">
                    <div className="detail-item">
                      <span className="detail-icon">🏢</span>
                      <div className="detail-content">
                        <strong>Office:</strong> {ado.office}
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <div className="detail-content">
                        <strong>{t('contact.district')}:</strong> {ado.district}
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-icon">🎯</span>
                      <div className="detail-content">
                        <strong>{t('contact.specialization')}:</strong> {ado.specialization}
                      </div>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <div className="detail-content">
                        <strong>{t('contact.location')}:</strong> {ado.address}
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-actions">
                    <a href={`tel:${ado.phone}`} className="contact-button phone">
                      <span className="button-icon">📞</span>
                      {t('contact.call')}
                    </a>
                    <a href={`mailto:${ado.email}`} className="contact-button email">
                      <span className="button-icon">✉️</span>
                      {t('contact.email')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Emergency Contact Section */}
          <div className="emergency-contact">
            <h3>🚨 Emergency Agricultural Helpline</h3>
            <div className="emergency-buttons">
              <a href="tel:1551" className="emergency-button">
                <span className="emergency-icon">📞</span>
                <div>
                  <strong>Kisan Call Centre</strong>
                  <p>1551 (Toll Free)</p>
                </div>
              </a>
              <a href="tel:18001801551" className="emergency-button">
                <span className="emergency-icon">🌾</span>
                <div>
                  <strong>Agriculture Helpline</strong>
                  <p>1800-180-1551</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
