import React, { useState } from 'react';
import './agrifarm.css';

const AgriContractForm = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    fatherName: '',
    phoneNumber: '',
    emailAddress: '',
    aadharNumber: '',
    
    // Address Information
    village: '',
    district: '',
    state: '',
    pinCode: '',
    
    // Land Information
    landAreaSatak: '',
    landLocation: '',
    soilType: '',
    waterSource: '',
    previousCrop: '',
    
    // Banking Information
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Agreement Terms
    agreeTerms: false,
    agreeTraining: false,
    agreeWages: false
  });

  const [contractDetails, setContractDetails] = useState({
    yearlyPayment: 0,
    totalContractValue: 0,
    trainingAllowance: 0,
    wagesPerMonth: 0
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Calculate contract values when land area changes
  React.useEffect(() => {
    const landArea = parseFloat(formData.landAreaSatak) || 0;
    const yearlyPayment = landArea * 500; // ₹500 per satak per year
    const totalContractValue = yearlyPayment * 5; // 5 years contract
    const trainingAllowance = 5000; // Fixed training allowance
    const wagesPerMonth = 3000; // Monthly wages for employment

    setContractDetails({
      yearlyPayment,
      totalContractValue,
      trainingAllowance,
      wagesPerMonth
    });
  }, [formData.landAreaSatak]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information Validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = 'Father\'s name is required';
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required';
    } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar number must be 12 digits';
    }

    // Address Validation
    if (!formData.village.trim()) newErrors.village = 'Village is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'PIN code must be 6 digits';
    }

    // Land Information Validation
    if (!formData.landAreaSatak) {
      newErrors.landAreaSatak = 'Land area is required';
    } else if (parseFloat(formData.landAreaSatak) <= 0) {
      newErrors.landAreaSatak = 'Land area must be greater than 0';
    }
    if (!formData.landLocation.trim()) newErrors.landLocation = 'Land location is required';
    if (!formData.soilType) newErrors.soilType = 'Soil type is required';
    if (!formData.waterSource) newErrors.waterSource = 'Water source is required';

    // Banking Information Validation
    if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    // Agreement Validation
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the contract terms';
    if (!formData.agreeTraining) newErrors.agreeTraining = 'You must agree to participate in training';
    if (!formData.agreeWages) newErrors.agreeWages = 'You must agree to the employment terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for API
      const submissionData = {
        // Personal Information
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        phoneNumber: formData.phoneNumber,
        emailAddress: formData.emailAddress,
        aadharNumber: formData.aadharNumber,
        
        // Address Information
        village: formData.village,
        district: formData.district,
        state: formData.state,
        pinCode: formData.pinCode,
        
        // Land Information
        landAreaSatak: parseFloat(formData.landAreaSatak),
        landLocation: formData.landLocation,
        soilType: formData.soilType,
        waterSource: formData.waterSource,
        previousCrop: formData.previousCrop,
        
        // Banking Information
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        
        // Agreement Terms
        agreeTerms: formData.agreeTerms,
        agreeTraining: formData.agreeTraining,
        agreeWages: formData.agreeWages
      };

      // Submit to backend API
      const response = await fetch('http://localhost:5000/api/contract-farming/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      const result = await response.json();

      if (result.success) {
        alert(`🎉 Contract application submitted successfully!\n\nContract ID: ${result.contractId}\n\nOur team will contact you within 2-3 business days for verification and next steps.`);
        
        // Reset form
        setFormData({
          fullName: '', fatherName: '', phoneNumber: '', emailAddress: '', aadharNumber: '',
          village: '', district: '', state: '', pinCode: '',
          landAreaSatak: '', landLocation: '', soilType: '', waterSource: '', previousCrop: '',
          bankName: '', accountNumber: '', ifscCode: '',
          agreeTerms: false, agreeTraining: false, agreeWages: false
        });
        setShowPreview(false);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showPreview) {
    return (
      <div className="contract-preview">
        <div className="preview-container">
          <div className="preview-header">
            <h1>🌾 KisanMitra Contract Farming Agreement Preview</h1>
            <div className="company-logo">
              <img src="/logo.png" alt="KisanMitra" />
            </div>
          </div>

          <div className="contract-summary">
            <h2>📋 Contract Summary</h2>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Farmer Name:</span>
                <span className="value">{formData.fullName}</span>
              </div>
              <div className="summary-item">
                <span className="label">Land Area:</span>
                <span className="value">{formData.landAreaSatak} Satak</span>
              </div>
              <div className="summary-item">
                <span className="label">Contract Duration:</span>
                <span className="value">5 Years</span>
              </div>
              <div className="summary-item">
                <span className="label">Yearly Payment:</span>
                <span className="value">₹{contractDetails.yearlyPayment.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Contract Value:</span>
                <span className="value">₹{contractDetails.totalContractValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-item">
                <span className="label">Training Allowance:</span>
                <span className="value">₹{contractDetails.trainingAllowance.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-item">
                <span className="label">Monthly Employment Wages:</span>
                <span className="value">₹{contractDetails.wagesPerMonth.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="farmer-details">
            <h3>👤 Farmer Details</h3>
            <div className="details-grid">
              <p><strong>Full Name:</strong> {formData.fullName}</p>
              <p><strong>Father's Name:</strong> {formData.fatherName}</p>
              <p><strong>Phone:</strong> {formData.phoneNumber}</p>
              <p><strong>Email:</strong> {formData.emailAddress || 'Not provided'}</p>
              <p><strong>Aadhar:</strong> {formData.aadharNumber}</p>
              <p><strong>Address:</strong> {formData.village}, {formData.district}, {formData.state} - {formData.pinCode}</p>
            </div>
          </div>

          <div className="land-details">
            <h3>🏞️ Land Details</h3>
            <div className="details-grid">
              <p><strong>Area:</strong> {formData.landAreaSatak} Satak</p>
              <p><strong>Location:</strong> {formData.landLocation}</p>
              <p><strong>Soil Type:</strong> {formData.soilType}</p>
              <p><strong>Water Source:</strong> {formData.waterSource}</p>
              <p><strong>Previous Crop:</strong> {formData.previousCrop || 'Not specified'}</p>
            </div>
          </div>

          <div className="banking-details">
            <h3>🏦 Banking Details</h3>
            <div className="details-grid">
              <p><strong>Bank Name:</strong> {formData.bankName}</p>
              <p><strong>Account Number:</strong> {formData.accountNumber}</p>
              <p><strong>IFSC Code:</strong> {formData.ifscCode.toUpperCase()}</p>
            </div>
          </div>

          <div className="contract-terms">
            <h3>📜 Contract Terms & Benefits</h3>
            <div className="terms-list">
              <div className="term-item">
                <h4>🌾 Land Lease Agreement</h4>
                <p>KisanMitra will lease your {formData.landAreaSatak} satak of land for agricultural purposes for a period of 5 years.</p>
              </div>
              <div className="term-item">
                <h4>💰 Payment Structure</h4>
                <p>You will receive ₹500 per satak per year, totalling ₹{contractDetails.yearlyPayment.toLocaleString('en-IN')} annually.</p>
              </div>
              <div className="term-item">
                <h4>🎓 Training Program</h4>
                <p>Comprehensive agricultural training will be provided with a one-time allowance of ₹{contractDetails.trainingAllowance.toLocaleString('en-IN')}.</p>
              </div>
              <div className="term-item">
                <h4>💼 Employment Opportunity</h4>
                <p>You will be employed by KisanMitra with monthly wages of ₹{contractDetails.wagesPerMonth.toLocaleString('en-IN')}.</p>
              </div>
              <div className="term-item">
                <h4>🔄 Additional Benefits</h4>
                <ul>
                  <li>Free seeds and fertilizers</li>
                  <li>Modern farming equipment access</li>
                  <li>Market linkage guarantee</li>
                  <li>Insurance coverage</li>
                  <li>Technical support</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="preview-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setShowPreview(false)}
            >
              ← Edit Details
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : '✅ Confirm & Submit Application'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="agri-contract-form">
      <div className="form-container">
        <div className="form-header">
          <h1>🌾 KisanMitra Contract Farming Application</h1>
          <p className="form-subtitle">
            Join our sustainable farming program with guaranteed income, training, and employment
          </p>
          <div className="benefits-summary">
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <span>₹500/Satak/Year</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📅</span>
              <span>5 Year Contract</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🎓</span>
              <span>Free Training</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💼</span>
              <span>Employment</span>
            </div>
          </div>
        </div>

        <form onSubmit={handlePreview} className="contract-form">
          {/* Personal Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">👤</span>
              Personal Information
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="fatherName">Father's Name *</label>
                <input
                  type="text"
                  id="fatherName"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Enter father's name"
                  className={errors.fatherName ? 'error' : ''}
                />
                {errors.fatherName && <span className="error-message">{errors.fatherName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number *</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  className={errors.phoneNumber ? 'error' : ''}
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="emailAddress">Email Address</label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  placeholder="your@email.com (optional)"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="aadharNumber">Aadhar Number *</label>
                <input
                  type="text"
                  id="aadharNumber"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  placeholder="12-digit Aadhar number"
                  className={errors.aadharNumber ? 'error' : ''}
                />
                {errors.aadharNumber && <span className="error-message">{errors.aadharNumber}</span>}
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">🏠</span>
              Address Information
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="village">Village/Town *</label>
                <input
                  type="text"
                  id="village"
                  name="village"
                  value={formData.village}
                  onChange={handleInputChange}
                  placeholder="Enter village/town name"
                  className={errors.village ? 'error' : ''}
                />
                {errors.village && <span className="error-message">{errors.village}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="district">District *</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="Enter district name"
                  className={errors.district ? 'error' : ''}
                />
                {errors.district && <span className="error-message">{errors.district}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="state">State *</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={errors.state ? 'error' : ''}
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="pinCode">PIN Code *</label>
                <input
                  type="text"
                  id="pinCode"
                  name="pinCode"
                  value={formData.pinCode}
                  onChange={handleInputChange}
                  placeholder="6-digit PIN code"
                  className={errors.pinCode ? 'error' : ''}
                />
                {errors.pinCode && <span className="error-message">{errors.pinCode}</span>}
              </div>
            </div>
          </div>

          {/* Land Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">🏞️</span>
              Land Information
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="landAreaSatak">Land Area (in Satak) *</label>
                <input
                  type="number"
                  id="landAreaSatak"
                  name="landAreaSatak"
                  value={formData.landAreaSatak}
                  onChange={handleInputChange}
                  placeholder="Enter land area in satak"
                  step="0.1"
                  min="0.1"
                  className={errors.landAreaSatak ? 'error' : ''}
                />
                {errors.landAreaSatak && <span className="error-message">{errors.landAreaSatak}</span>}
                {formData.landAreaSatak && (
                  <div className="calculation-info">
                    <p>💰 Yearly Payment: ₹{contractDetails.yearlyPayment.toLocaleString('en-IN')}</p>
                    <p>🎯 5-Year Total: ₹{contractDetails.totalContractValue.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="landLocation">Land Location/Survey Number *</label>
                <input
                  type="text"
                  id="landLocation"
                  name="landLocation"
                  value={formData.landLocation}
                  onChange={handleInputChange}
                  placeholder="Survey number or location details"
                  className={errors.landLocation ? 'error' : ''}
                />
                {errors.landLocation && <span className="error-message">{errors.landLocation}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="soilType">Soil Type *</label>
                <select
                  id="soilType"
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleInputChange}
                  className={errors.soilType ? 'error' : ''}
                >
                  <option value="">Select Soil Type</option>
                  <option value="Black Soil">Black Soil (Cotton Soil)</option>
                  <option value="Red Soil">Red Soil</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                  <option value="Laterite Soil">Laterite Soil</option>
                  <option value="Sandy Soil">Sandy Soil</option>
                  <option value="Clay Soil">Clay Soil</option>
                  <option value="Loamy Soil">Loamy Soil</option>
                </select>
                {errors.soilType && <span className="error-message">{errors.soilType}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="waterSource">Water Source *</label>
                <select
                  id="waterSource"
                  name="waterSource"
                  value={formData.waterSource}
                  onChange={handleInputChange}
                  className={errors.waterSource ? 'error' : ''}
                >
                  <option value="">Select Water Source</option>
                  <option value="Borewell">Borewell</option>
                  <option value="Canal">Canal</option>
                  <option value="River">River</option>
                  <option value="Pond">Pond</option>
                  <option value="Rainwater">Rainwater</option>
                  <option value="Tube Well">Tube Well</option>
                  <option value="Multiple Sources">Multiple Sources</option>
                </select>
                {errors.waterSource && <span className="error-message">{errors.waterSource}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="previousCrop">Previous Crop Grown</label>
                <input
                  type="text"
                  id="previousCrop"
                  name="previousCrop"
                  value={formData.previousCrop}
                  onChange={handleInputChange}
                  placeholder="Last crop grown on this land (optional)"
                />
              </div>
            </div>
          </div>

          {/* Banking Information Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">🏦</span>
              Banking Information
            </h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bankName">Bank Name *</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
                  className={errors.bankName ? 'error' : ''}
                />
                {errors.bankName && <span className="error-message">{errors.bankName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="accountNumber">Account Number *</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  className={errors.accountNumber ? 'error' : ''}
                />
                {errors.accountNumber && <span className="error-message">{errors.accountNumber}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ifscCode">IFSC Code *</label>
                <input
                  type="text"
                  id="ifscCode"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC code"
                  className={errors.ifscCode ? 'error' : ''}
                />
                {errors.ifscCode && <span className="error-message">{errors.ifscCode}</span>}
              </div>
            </div>
          </div>

          {/* Agreement Terms Section */}
          <div className="form-section">
            <h2 className="section-title">
              <span className="section-icon">📜</span>
              Agreement Terms
            </h2>
            
            <div className="agreement-terms">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    I agree to lease my land to KisanMitra for 5 years at ₹500 per satak per year
                  </span>
                </label>
                {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeTraining"
                    checked={formData.agreeTraining}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    I agree to participate in agricultural training programs and receive ₹{contractDetails.trainingAllowance.toLocaleString('en-IN')} training allowance
                  </span>
                </label>
                {errors.agreeTraining && <span className="error-message">{errors.agreeTraining}</span>}
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeWages"
                    checked={formData.agreeWages}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    I agree to be employed by KisanMitra and receive monthly wages of ₹{contractDetails.wagesPerMonth.toLocaleString('en-IN')}
                  </span>
                </label>
                {errors.agreeWages && <span className="error-message">{errors.agreeWages}</span>}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              📋 Preview Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgriContractForm;
