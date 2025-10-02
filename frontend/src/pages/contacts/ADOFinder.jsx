import React, { useState, useEffect } from 'react';
import './ADOFinder.css';

const ADOFinder = () => {
  const [officers, setOfficers] = useState([]);
  const [filteredOfficers, setFilteredOfficers] = useState([]);
  const [states, setStates] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique districts for selected state
  const [availableDistricts, setAvailableDistricts] = useState([]);

  useEffect(() => {
    // Load officers data
    fetch('/data/agriculture-officers.json')
      .then(response => response.json())
      .then(data => {
        setOfficers(data.agricultureOfficers);
        setFilteredOfficers(data.agricultureOfficers);
        setStates(data.states);
        setSpecializations(data.specializations);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading officers data:', error);
        setLoading(false);
      });
  }, []);

  // Update available districts when state changes
  useEffect(() => {
    if (selectedState) {
      const stateOfficers = officers.filter(officer => 
        officer.location.state === selectedState
      );
      const districts = [...new Set(stateOfficers.flatMap(officer => 
        [officer.location.district, ...officer.serviceArea.districts]
      ))];
      setAvailableDistricts(districts.sort());
    } else {
      setAvailableDistricts([]);
    }
  }, [selectedState, officers]);

  // Filter officers based on search criteria
  useEffect(() => {
    let filtered = officers;

    if (selectedState) {
      filtered = filtered.filter(officer => 
        officer.location.state === selectedState ||
        officer.serviceArea.districts.includes(selectedState)
      );
    }

    if (selectedDistrict) {
      filtered = filtered.filter(officer => 
        officer.location.district === selectedDistrict ||
        officer.serviceArea.districts.includes(selectedDistrict)
      );
    }

    if (selectedSpecialization) {
      filtered = filtered.filter(officer => 
        officer.specialization.includes(selectedSpecialization)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(officer => 
        officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.specialization.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredOfficers(filtered);
  }, [selectedState, selectedDistrict, selectedSpecialization, searchTerm, officers]);

  const handleContactOfficer = (officer, method) => {
    switch (method) {
      case 'phone':
        window.open(`tel:${officer.contact.phone}`);
        break;
      case 'email':
        window.open(`mailto:${officer.contact.email}?subject=Agriculture Consultation Request`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${officer.contact.whatsapp.replace(/[^0-9]/g, '')}?text=Hello, I need agriculture consultation.`);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedSpecialization('');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="ado-finder-container">
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner-wrapper">
              <div className="spinner"></div>
              <div className="spinner-inner"></div>
            </div>
            <div className="loading-text">
              <h3>Loading Agriculture Officers...</h3>
              <p>Finding the best agricultural experts in your area</p>
            </div>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ado-finder-container">
      {/* Header */}
      <div className="ado-header">
        <h1>🌾 Find Agriculture Development Officers</h1>
        <p>Connect with expert agricultural officers in your area for guidance and support</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search by name, designation, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-row">
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict(''); // Reset district when state changes
            }}
            className="filter-select"
          >
            <option value="">📍 Select State</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="filter-select"
            disabled={!selectedState}
          >
            <option value="">🏘️ Select District</option>
            {availableDistricts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>

          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="filter-select"
          >
            <option value="">🎯 Select Specialization</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>

          <button onClick={clearFilters} className="clear-filters-btn">
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Found <strong>{filteredOfficers.length}</strong> officers matching your criteria</p>
      </div>

      {/* Officers List */}
      <div className="officers-grid">
        {filteredOfficers.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No officers found</h3>
            <p>Try adjusting your search criteria or clearing filters</p>
            <button onClick={clearFilters} className="retry-btn">
              Clear Filters
            </button>
          </div>
        ) : (
          filteredOfficers.map(officer => (
            <div key={officer.id} className="officer-card">
              <div className="officer-header">
                <div className="officer-basic-info">
                  <h3>{officer.name}</h3>
                  <p className="designation">{officer.designation}</p>
                  <div className="rating">
                    <span className="stars">⭐</span>
                    <span>{officer.rating}</span>
                  </div>
                </div>
              </div>

              <div className="officer-details">
                <div className="location-info">
                  <h4>📍 Location & Service Area</h4>
                  <p><strong>Based in:</strong> {officer.location.district}, {officer.location.state}</p>
                  <p><strong>Serves:</strong> {officer.serviceArea.districts.join(', ')}</p>
                  <p><strong>Coverage:</strong> {officer.serviceArea.radius}</p>
                </div>

                {officer.office_address && (
                  <div className="office-info">
                    <h4>🏢 Office Address</h4>
                    <p>{officer.office_address}</p>
                  </div>
                )}

                <div className="specialization-info">
                  <h4>🎯 Specializations</h4>
                  <div className="specialization-tags">
                    {officer.specialization.map(spec => (
                      <span key={spec} className="spec-tag">{spec}</span>
                    ))}
                  </div>
                </div>

                <div className="experience-info">
                  <h4>💼 Experience & Languages</h4>
                  <p><strong>Experience:</strong> {officer.experience}</p>
                  <p><strong>Languages:</strong> {officer.languages.join(', ')}</p>
                </div>

                <div className="availability-info">
                  <h4>🕒 Availability</h4>
                  <p><strong>Days:</strong> {officer.availability.days.join(', ')}</p>
                  <p><strong>Hours:</strong> {officer.availability.hours}</p>
                </div>
              </div>

              <div className="contact-actions">
                <h4>📞 Contact Options</h4>
                <div className="contact-buttons">
                  <button 
                    onClick={() => handleContactOfficer(officer, 'phone')}
                    className="contact-btn phone-btn"
                  >
                    📞 Call
                  </button>
                  <button 
                    onClick={() => handleContactOfficer(officer, 'whatsapp')}
                    className="contact-btn whatsapp-btn"
                  >
                    💬 WhatsApp
                  </button>
                  <button 
                    onClick={() => handleContactOfficer(officer, 'email')}
                    className="contact-btn email-btn"
                  >
                    ✉️ Email
                  </button>
                  {officer.contact.office && (
                    <button 
                      onClick={() => window.open(`tel:${officer.contact.office}`, '_self')}
                      className="contact-btn office-btn"
                    >
                      🏢 Office
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>💡 How to use this service</h3>
        <div className="help-items">
          <div className="help-item">
            <span className="help-icon">🔍</span>
            <p><strong>Search:</strong> Use filters to find officers by location or specialization</p>
          </div>
          <div className="help-item">
            <span className="help-icon">📞</span>
            <p><strong>Contact:</strong> Call, WhatsApp, or email officers directly</p>
          </div>
          <div className="help-item">
            <span className="help-icon">🕒</span>
            <p><strong>Timing:</strong> Check availability before contacting</p>
          </div>
          <div className="help-item">
            <span className="help-icon">💼</span>
            <p><strong>Free Service:</strong> All consultations are free of charge</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ADOFinder;