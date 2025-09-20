import React, { useState, useMemo } from 'react';
import './KhetiSaath.css';

// Agriculture data moved outside component to prevent re-creation on each render
const agricultureData = [
  // Machines
  {
    id: 1,
    category: 'Machine',
    name: 'Tractor',
    description: 'Multi-purpose farming vehicle for land preparation, plowing, and transportation',
    image: '🚜',
    usageInstructions: [
      'Check fuel, oil, and hydraulic fluid levels before starting',
      'Ensure proper attachment of implements (plow, harrow, etc.)',
      'Start engine and let it warm up for 5-10 minutes',
      'Adjust speed according to soil conditions (2-5 km/h for plowing)',
      'Maintain straight furrows with consistent depth',
      'Clean equipment after use to prevent rust',
      'Check tire pressure and adjust for field conditions',
      'Engage PTO at correct RPM for implement operation',
      'Monitor engine temperature during heavy operations',
      'Use proper ballasting for stability and traction'
    ],
    safetyTips: 'Always wear protective gear, check brakes before operation, and never leave running tractor unattended.',
    maintenanceTips: {
      daily: [
        'Check engine oil level',
        'Inspect tires for damage or wear',
        'Clean air filter if dusty conditions',
        'Check hydraulic fluid level'
      ],
      weekly: [
        'Grease all lubrication points',
        'Check battery terminals and electrolyte',
        'Inspect belts for wear and proper tension',
        'Clean radiator screen'
      ],
      monthly: [
        'Change engine oil and filter',
        'Check transmission fluid',
        'Inspect hydraulic hoses for leaks',
        'Test all safety systems'
      ]
    },
    priceRange: '₹4-15 lakhs (depending on HP and features)',
    recommendedBrands: ['Mahindra', 'Tafe', 'New Holland', 'John Deere', 'Sonalika'],
    specifications: {
      'Engine Power': '25-75 HP (typical range)',
      'Fuel Type': 'Diesel',
      'Transmission': 'Manual/Power Steering',
      'Lifting Capacity': '1200-2500 kg'
    },
    videoUrl: 'https://www.youtube.com/embed/tractor-operation',
    additionalInfo: [
      'Consider soil type when selecting tractor size',
      'Proper implement matching is crucial for efficiency',
      'Regular servicing extends equipment life significantly',
      'Training operators reduces breakdown risks'
    ]
  },
  {
    id: 2,
    category: 'Machine',
    name: 'Combine Harvester',
    description: 'Multi-functional machine for cutting, threshing, and cleaning grain crops',
    image: '🌾',
    usageInstructions: [
      'Check crop moisture content (optimal: 18-22%)',
      'Adjust cutting height according to crop type',
      'Set threshing speed based on grain type',
      'Monitor grain tank and unload when 80% full',
      'Clean sieves and filters regularly during operation',
      'Maintain consistent forward speed (4-6 km/h)'
    ],
    safetyTips: 'Keep hands away from moving parts, use proper lighting for night operations, and check fire extinguisher.'
  },
  {
    id: 3,
    category: 'Machine',
    name: 'Rotavator',
    description: 'Rotary tiller for breaking and mixing soil for seedbed preparation',
    image: '🌿',
    usageInstructions: [
      'Set appropriate working depth (8-12 cm)',
      'Check soil conditions - avoid overly wet soil',
      'Maintain PTO speed at 540 RPM',
      'Work at steady speed (4-6 km/h)',
      'Inspect and replace worn tines',
      'Grease all fittings after every 10 hours'
    ],
    safetyTips: 'Use proper PTO guards, avoid rocky areas, and never attempt to clear blockages while running.'
  },
  {
    id: 4,
    category: 'Machine',
    name: 'Seed Drill',
    description: 'Precision equipment for seed placement and fertilizer application',
    image: '🌱',
    usageInstructions: [
      'Calibrate seed rate according to crop requirements',
      'Fill seed and fertilizer hoppers properly',
      'Set appropriate seeding depth (1-3 cm for most crops)',
      'Maintain uniform forward speed (6-8 km/h)',
      'Check for blockages in tubes regularly',
      'Clean and store in dry place after use'
    ],
    safetyTips: 'Wear dust masks when handling seeds, check for sharp edges, and ensure proper ventilation.'
  },

  // Tools
  {
    id: 5,
    category: 'Tool',
    name: 'Pesticide Sprayer',
    description: 'Equipment for applying pesticides, herbicides, and liquid fertilizers',
    image: '💨',
    usageInstructions: [
      'Calibrate spray rate and pressure settings',
      'Check nozzles for even spray pattern',
      'Mix chemicals according to label instructions',
      'Spray during calm weather conditions',
      'Maintain consistent boom height (50-60 cm)',
      'Clean tank thoroughly after each use'
    ],
    safetyTips: 'Wear protective clothing and respirator, avoid spraying in windy conditions, and store chemicals safely.'
  },
  {
    id: 6,
    category: 'Tool',
    name: 'Agricultural Drone',
    description: 'UAV for crop monitoring, spraying, and precision agriculture',
    image: '🚁',
    usageInstructions: [
      'Check weather conditions before flight',
      'Calibrate GPS and sensors',
      'Plan flight path using mapping software',
      'Monitor battery levels during operation',
      'Maintain safe altitude (10-15 meters)',
      'Download and analyze collected data',
      'Perform pre-flight safety checklist',
      'Set up ground control station',
      'Configure camera and sensor settings',
      'Establish communication links',
      'Monitor airspace restrictions'
    ],
    safetyTips: 'Follow aviation regulations, avoid populated areas, and maintain visual contact with drone.',
    maintenanceTips: {
      daily: [
        'Check propeller condition and tightness',
        'Inspect battery charge and connections',
        'Clean camera lens and gimbal',
        'Verify GPS signal strength'
      ],
      weekly: [
        'Update firmware and software',
        'Calibrate sensors and compass',
        'Check motor bearings for smooth operation',
        'Clean and inspect frame for damage'
      ],
      monthly: [
        'Replace propellers if worn',
        'Deep clean electronic components',
        'Test emergency landing procedures',
        'Backup and organize flight data'
      ]
    },
    priceRange: '₹50,000-5 lakhs (depending on features)',
    recommendedBrands: ['DJI Agras', 'XAG', 'Mahindra Drone', 'BharatDrone'],
    specifications: {
      'Flight Time': '15-30 minutes',
      'Payload Capacity': '5-20 liters',
      'Coverage Area': '1-5 hectares per flight',
      'Operating Range': '1-7 km'
    },
    videoUrl: 'https://www.youtube.com/embed/agricultural-drone-operation',
    additionalInfo: [
      'Requires DGCA registration and pilot license',
      'Weather conditions significantly affect performance',
      'Regular calibration ensures accurate data collection',
      'Insurance recommended for commercial operations'
    ]
  },
  {
    id: 7,
    category: 'Tool',
    name: 'Soil pH Sensor',
    description: 'Digital device for measuring soil acidity and nutrient levels',
    image: '📊',
    usageInstructions: [
      'Clean sensor probe with distilled water',
      'Insert probe 4-6 inches into moist soil',
      'Wait for reading to stabilize (2-3 minutes)',
      'Take multiple readings across the field',
      'Record GPS coordinates for each measurement',
      'Clean and store sensor properly after use'
    ],
    safetyTips: 'Handle sensor carefully, avoid extreme temperatures, and calibrate regularly.'
  },
  {
    id: 8,
    category: 'Tool',
    name: 'Irrigation Timer',
    description: 'Automated system for controlling irrigation schedules',
    image: '⏰',
    usageInstructions: [
      'Program watering schedule based on crop needs',
      'Set duration for each irrigation zone',
      'Test all valves and connections',
      'Monitor soil moisture levels',
      'Adjust schedule based on weather conditions',
      'Perform regular maintenance checks'
    ],
    safetyTips: 'Protect from weather, use GFCI outlets, and backup programming settings.'
  },

  // Chemical Fertilizers
  {
    id: 9,
    category: 'Chemical Fertilizer',
    name: 'NPK (10-26-26)',
    description: 'Balanced fertilizer with nitrogen, phosphorus, and potassium',
    image: '🧪',
    usageInstructions: [
      'Apply 200-300 kg per hectare for cereals',
      'Mix with soil before planting or as top dressing',
      'Water thoroughly after application',
      'Apply in split doses for better absorption',
      'Avoid direct contact with seeds',
      'Store in cool, dry place away from moisture'
    ],
    safetyTips: 'Wear gloves when handling, avoid inhalation, and keep away from children and pets.'
  },
  {
    id: 10,
    category: 'Chemical Fertilizer',
    name: 'Urea (46-0-0)',
    description: 'High nitrogen fertilizer for vegetative growth',
    image: '💎',
    usageInstructions: [
      'Apply 100-150 kg per hectare for wheat',
      'Incorporate into soil immediately after application',
      'Apply when soil moisture is adequate',
      'Split application in 2-3 doses',
      'Avoid application during hot weather',
      'Use within one year of purchase'
    ],
    safetyTips: 'Handle with care, avoid skin contact, and ensure proper ventilation during storage.'
  },
  {
    id: 11,
    category: 'Chemical Fertilizer',
    name: 'DAP (18-46-0)',
    description: 'Diammonium phosphate for root development and flowering',
    image: '🔶',
    usageInstructions: [
      'Apply 100-125 kg per hectare at sowing time',
      'Place 2-3 cm below and beside the seed',
      'Suitable for all crops, especially legumes',
      'Mix with soil for better nutrient availability',
      'Apply when soil temperature is optimal',
      'Combine with organic matter for best results'
    ],
    safetyTips: 'Store in moisture-free environment, use protective equipment, and avoid contamination.'
  },

  // Organic Alternatives
  {
    id: 12,
    category: 'Organic Alternative',
    name: 'Compost',
    description: 'Decomposed organic matter for soil fertility improvement',
    image: '🍂',
    usageInstructions: [
      'Apply 5-10 tons per hectare annually',
      'Mix thoroughly with topsoil',
      'Apply 2-4 weeks before planting',
      'Ensure compost is fully decomposed',
      'Water lightly after application',
      'Reapply every growing season'
    ],
    safetyTips: 'Use well-aged compost, avoid fresh manure, and maintain proper moisture levels.'
  },
  {
    id: 13,
    category: 'Organic Alternative',
    name: 'Cow Dung Manure',
    description: 'Traditional organic fertilizer rich in nutrients and beneficial microbes',
    image: '🐄',
    usageInstructions: [
      'Age manure for 6-12 months before use',
      'Apply 15-20 tons per hectare',
      'Incorporate into soil 3-4 weeks before planting',
      'Mix with crop residues for better results',
      'Apply during cool weather to prevent burning',
      'Use as mulch around established plants'
    ],
    safetyTips: 'Always use aged manure, wear gloves, and avoid fresh application near harvest.'
  },
  {
    id: 14,
    category: 'Organic Alternative',
    name: 'Vermicompost',
    description: 'Worm-processed organic matter with high nutrient content',
    image: '🪱',
    usageInstructions: [
      'Apply 2-3 tons per hectare',
      'Mix with potting soil for container plants',
      'Use as soil amendment before planting',
      'Apply around plant base for established crops',
      'Water gently after application',
      'Store in shaded, ventilated area'
    ],
    safetyTips: 'Keep moist but not waterlogged, protect from extreme temperatures.'
  },
  {
    id: 15,
    category: 'Organic Alternative',
    name: 'Green Manure',
    description: 'Fresh plant material incorporated into soil for fertility',
    image: '🌱',
    usageInstructions: [
      'Grow leguminous crops like dhaincha or sunhemp',
      'Cut plants at flowering stage',
      'Incorporate into soil 2-3 weeks before main crop',
      'Add 150-200 kg per hectare of fresh material',
      'Ensure proper decomposition before planting',
      'Combine with lime if soil is acidic'
    ],
    safetyTips: 'Choose appropriate green manure crops, ensure proper decomposition time.'
  },

  // Homemade Ingredients
  {
    id: 16,
    category: 'Homemade Ingredient',
    name: 'Neem Oil Bio-pesticide',
    description: 'Natural pesticide made from neem seeds',
    image: '🌿',
    usageInstructions: [
      'Mix 10-15 ml neem oil per liter of water',
      'Add 2-3 drops of liquid soap as emulsifier',
      'Spray during early morning or evening',
      'Apply every 7-10 days during pest season',
      'Cover both upper and lower leaf surfaces',
      'Prepare fresh solution each time'
    ],
    safetyTips: 'Test on small area first, avoid during flowering for bee safety.'
  },
  {
    id: 17,
    category: 'Homemade Ingredient',
    name: 'Banana Peel Fertilizer',
    description: 'Potassium-rich organic fertilizer from banana peels',
    image: '🍌',
    usageInstructions: [
      'Collect and chop banana peels into small pieces',
      'Bury pieces around plant base or compost',
      'For liquid fertilizer: soak peels in water for 48 hours',
      'Strain and dilute 1:5 with water before application',
      'Apply monthly during growing season',
      'Mix with other organic materials for balanced nutrition'
    ],
    safetyTips: 'Use organic bananas if possible, compost properly to avoid pests.'
  },
  {
    id: 18,
    category: 'Homemade Ingredient',
    name: 'Epsom Salt Solution',
    description: 'Magnesium sulfate solution for plant nutrition',
    image: '🧂',
    usageInstructions: [
      'Dissolve 1-2 tablespoons in 1 gallon of water',
      'Apply monthly to tomatoes, peppers, and roses',
      'Spray on leaves for quick magnesium uptake',
      'Use for seed starting mix enhancement',
      'Apply to soil around magnesium-deficient plants',
      'Do not exceed recommended concentration'
    ],
    safetyTips: 'Test soil magnesium levels first, avoid overuse which can cause imbalances.'
  },
  {
    id: 19,
    category: 'Homemade Ingredient',
    name: 'Garlic-Chili Spray',
    description: 'Natural pest deterrent made from garlic and chilies',
    image: '🌶️',
    usageInstructions: [
      'Blend 10 garlic cloves and 10 hot chilies with water',
      'Strain and dilute 1:10 with water',
      'Add few drops of liquid soap',
      'Spray on affected plants in evening',
      'Reapply after rain or every 5-7 days',
      'Store concentrate in refrigerator for up to 1 week'
    ],
    safetyTips: 'Wear gloves when handling, avoid contact with eyes, test on small area first.'
  },
  {
    id: 20,
    category: 'Homemade Ingredient',
    name: 'Eggshell Calcium',
    description: 'Calcium supplement made from crushed eggshells',
    image: '🥚',
    usageInstructions: [
      'Clean and dry eggshells thoroughly',
      'Crush into fine powder or small pieces',
      'Mix into soil around calcium-loving plants',
      'Add to compost pile for calcium enrichment',
      'Sprinkle around plants to deter slugs',
      'Apply 1-2 tablespoons per plant monthly'
    ],
    safetyTips: 'Ensure shells are completely clean, crush to avoid sharp edges.'
  },
];

const KhetiSaath = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ['All', 'Machine', 'Tool', 'Chemical Fertilizer', 'Organic Alternative', 'Homemade Ingredient'];

  // Modal control functions
  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  // Close modal on escape key
  React.useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isModalOpen]);

  // Filter and search functionality
  const filteredData = useMemo(() => {
    return agricultureData.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="kheti-saath-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🌾KisanGuide</h1>
          <p>Your comprehensive guide to farming equipment, tools, fertilizers, and organic alternatives</p>
        </div>
      </div>

      <div className="container">
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for equipment, tools, fertilizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          <div className="results-header">
            <h2>
              {searchTerm || selectedCategory !== 'All' 
                ? `${filteredData.length} results found` 
                : `All Agriculture Resources (${filteredData.length})`}
            </h2>
          </div>

          <div className="items-grid">
            {filteredData.map(item => (
              <div key={item.id} className="item-card" data-category={item.category}>
                <div className="item-header">
                  <div className="item-image">{item.image}</div>
                  <div className="item-category">{item.category}</div>
                </div>
                
                <div className="item-content">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  
                  <div className="usage-section">
                    <h4>📋 Usage Instructions:</h4>
                    <ol className="usage-list">
                      {item.usageInstructions.slice(0, 3).map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                      {item.usageInstructions.length > 3 && (
                        <li className="more-indicator">...and {item.usageInstructions.length - 3} more steps</li>
                      )}
                    </ol>
                  </div>

                  <div className="safety-section">
                    <h4>⚠️ Safety Tips:</h4>
                    <p className="safety-tips">{item.safetyTips}</p>
                  </div>
                </div>

                <div className="item-actions">
                  <button 
                    className="view-details-btn"
                    onClick={() => openModal(item)}
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No results found</h3>
              <p>Try adjusting your search terms or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <span className="modal-item-image">{selectedItem.image}</span>
                <div>
                  <h2 className="modal-title">{selectedItem.name}</h2>
                  <span className="modal-category">{selectedItem.category}</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-description">
                <p>{selectedItem.description}</p>
              </div>

              {/* Complete Usage Instructions */}
              <div className="modal-section">
                <h3>📋 Complete Usage Instructions:</h3>
                <ol className="modal-usage-list">
                  {selectedItem.usageInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              {/* Safety Tips */}
              <div className="modal-section">
                <h3>⚠️ Safety Tips:</h3>
                <div className="modal-safety-tips">
                  <p>{selectedItem.safetyTips}</p>
                </div>
              </div>

              {/* Maintenance Tips */}
              {selectedItem.maintenanceTips && (
                <div className="modal-section">
                  <h3>🔧 Maintenance Schedule:</h3>
                  <div className="maintenance-schedule">
                    <div className="maintenance-period">
                      <h4>Daily Maintenance:</h4>
                      <ul>
                        {selectedItem.maintenanceTips.daily.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="maintenance-period">
                      <h4>Weekly Maintenance:</h4>
                      <ul>
                        {selectedItem.maintenanceTips.weekly.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="maintenance-period">
                      <h4>Monthly Maintenance:</h4>
                      <ul>
                        {selectedItem.maintenanceTips.monthly.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Specifications */}
              {selectedItem.specifications && (
                <div className="modal-section">
                  <h3>📊 Technical Specifications:</h3>
                  <div className="specifications-grid">
                    {Object.entries(selectedItem.specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range and Brands */}
              <div className="modal-info-grid">
                {selectedItem.priceRange && (
                  <div className="modal-section">
                    <h3>💰 Price Range:</h3>
                    <p className="price-range">{selectedItem.priceRange}</p>
                  </div>
                )}

                {selectedItem.recommendedBrands && (
                  <div className="modal-section">
                    <h3>🏆 Recommended Brands:</h3>
                    <div className="brands-list">
                      {selectedItem.recommendedBrands.map((brand, index) => (
                        <span key={index} className="brand-tag">{brand}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Embed */}
              {selectedItem.videoUrl && (
                <div className="modal-section">
                  <h3>🎥 Demonstration Video:</h3>
                  <div className="video-container">
                    <iframe
                      src={selectedItem.videoUrl}
                      title={`${selectedItem.name} demonstration`}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {selectedItem.additionalInfo && (
                <div className="modal-section">
                  <h3>💡 Additional Tips:</h3>
                  <ul className="additional-info-list">
                    {selectedItem.additionalInfo.map((info, index) => (
                      <li key={index}>{info}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-action-btn primary">Add to Favorites</button>
              <button className="modal-action-btn secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhetiSaath;
