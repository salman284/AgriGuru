import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SellProducts.css';

const SellProducts = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    category: 'vegetables',
    description: '',
    price: '',
    quantity: '',
    unit: 'kg',
    location: '',
    phoneNumber: '',
    productImage: null,
    organicCertified: false,
    deliveryAvailable: false,
    harvestDate: ''
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'vegetables', label: '🥬 Vegetables', icon: '🥬' },
    { value: 'fruits', label: '🍎 Fruits', icon: '🍎' },
    { value: 'grains', label: '🌾 Grains & Cereals', icon: '🌾' },
    { value: 'pulses', label: '🫘 Pulses & Legumes', icon: '🫘' },
    { value: 'dairy', label: '🥛 Dairy Products', icon: '🥛' },
    { value: 'poultry', label: '🐔 Poultry & Eggs', icon: '🐔' },
    { value: 'spices', label: '🌶️ Spices & Herbs', icon: '🌶️' },
    { value: 'honey', label: '🍯 Honey & Bee Products', icon: '🍯' },
    { value: 'organic', label: '🌱 Organic Products', icon: '🌱' },
    { value: 'other', label: '📦 Other', icon: '📦' }
  ];

  const units = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'quintal', label: 'Quintals' },
    { value: 'ton', label: 'Tons' },
    { value: 'piece', label: 'Pieces' },
    { value: 'dozen', label: 'Dozens' },
    { value: 'liter', label: 'Liters' },
    { value: 'bundle', label: 'Bundles' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, productImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend
    console.log('Product submission:', formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    
    // Reset form after 3 seconds and redirect
    setTimeout(() => {
      setSubmitted(false);
      navigate('/marketplace');
    }, 3000);
  };

  const calculateEstimatedEarnings = () => {
    const price = parseFloat(formData.price) || 0;
    const quantity = parseFloat(formData.quantity) || 0;
    const platformFee = 0.05; // 5% platform fee
    
    const total = price * quantity;
    const fee = total * platformFee;
    const earnings = total - fee;
    
    return { total, fee, earnings };
  };

  const { total, fee, earnings } = calculateEstimatedEarnings();

  return (
    <div className="sell-products-container">
      {/* Header Banner */}
      <div className="sell-header">
        <div className="sell-header-content">
          <h1>🌾 Sell Your Farm Products</h1>
          <p>Connect directly with buyers and get the best price for your produce</p>
          <div className="benefits">
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <span>Best Prices</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🚚</span>
              <span>Easy Delivery</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📱</span>
              <span>Simple Process</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🤝</span>
              <span>Direct to Buyer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sell-main">
        {/* Success Message */}
        {submitted && (
          <div className="success-banner">
            <div className="success-content">
              <span className="success-icon">✅</span>
              <div>
                <h3>Product Listed Successfully!</h3>
                <p>Your product has been added to the marketplace. Redirecting...</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        <div className="sell-form-container">
          <form onSubmit={handleSubmit} className="sell-form">
            <div className="form-section">
              <h2>📝 Product Information</h2>
              
              <div className="form-group">
                <label htmlFor="productName">
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Organic Tomatoes"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product, its quality, growing conditions, etc."
                  rows="4"
                  required
                />
                <small>Be detailed to attract more buyers!</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">
                    Price per Unit (₹) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="unit">
                    Unit <span className="required">*</span>
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">
                    Available Quantity <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="harvestDate">
                  Harvest/Production Date
                </label>
                <input
                  type="date"
                  id="harvestDate"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-section">
              <h2>📸 Product Image</h2>
              
              <div className="image-upload-section">
                <div className="image-upload-area">
                  {previewImage ? (
                    <div className="image-preview">
                      <img src={previewImage} alt="Product preview" />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData(prev => ({ ...prev, productImage: null }));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <p>Click to upload product image</p>
                      <small>JPG, PNG or WEBP (Max 5MB)</small>
                    </div>
                  )}
                  <input
                    type="file"
                    id="productImage"
                    name="productImage"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="file-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>📍 Location & Contact</h2>
              
              <div className="form-group">
                <label htmlFor="location">
                  Location <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Village, District, State"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">
                  Contact Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  pattern="[0-9+\s-]+"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h2>✨ Additional Features</h2>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="organicCertified"
                    checked={formData.organicCertified}
                    onChange={handleInputChange}
                  />
                  <span>🌱 Organic Certified Product</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="deliveryAvailable"
                    checked={formData.deliveryAvailable}
                    onChange={handleInputChange}
                  />
                  <span>🚚 Delivery Available</span>
                </label>
              </div>
            </div>

            {/* Earnings Summary */}
            {formData.price && formData.quantity && (
              <div className="earnings-summary">
                <h3>💰 Estimated Earnings</h3>
                <div className="earnings-details">
                  <div className="earnings-row">
                    <span>Total Sale Value:</span>
                    <strong>₹{total.toFixed(2)}</strong>
                  </div>
                  <div className="earnings-row fee">
                    <span>Platform Fee (5%):</span>
                    <span>- ₹{fee.toFixed(2)}</span>
                  </div>
                  <div className="earnings-row total">
                    <span>Your Earnings:</span>
                    <strong>₹{earnings.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/marketplace')}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                📤 List Product for Sale
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h3>💡 Tips for Better Sales</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-icon">📸</span>
              <h4>High-Quality Photos</h4>
              <p>Upload clear, well-lit photos of your products</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">📝</span>
              <h4>Detailed Description</h4>
              <p>Include information about freshness, quality, and growing practices</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">💵</span>
              <h4>Fair Pricing</h4>
              <p>Check market rates and set competitive prices</p>
            </div>
            <div className="tip-card">
              <span className="tip-icon">⚡</span>
              <h4>Quick Response</h4>
              <p>Respond promptly to buyer inquiries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellProducts;
