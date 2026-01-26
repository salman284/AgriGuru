import React, { useState } from 'react';
import './ModalStyles.css';

const DeliveryModal = ({ onClose, cart }) => {
  const [deliveryData, setDeliveryData] = useState({
    pincode: '',
    city: '',
    state: '',
    estimatedDays: null,
    route: []
  });

  const [isTrackingOrder, setIsTrackingOrder] = useState(false);

  // Sample delivery routes and timing data
  const deliveryRoutes = {
    '110001': { city: 'New Delhi', state: 'Delhi', days: 1, route: ['Warehouse Delhi', 'Delhi Hub', 'Local Delivery'] },
    '400001': { city: 'Mumbai', state: 'Maharashtra', days: 2, route: ['Warehouse Delhi', 'Mumbai Hub', 'Local Delivery'] },
    '560001': { city: 'Bangalore', state: 'Karnataka', days: 2, route: ['Warehouse Delhi', 'Bangalore Hub', 'Local Delivery'] },
    '600001': { city: 'Chennai', state: 'Tamil Nadu', days: 3, route: ['Warehouse Delhi', 'Chennai Hub', 'Local Delivery'] },
    '700001': { city: 'Kolkata', state: 'West Bengal', days: 2, route: ['Warehouse Delhi', 'Kolkata Hub', 'Local Delivery'] },
    '411001': { city: 'Pune', state: 'Maharashtra', days: 2, route: ['Warehouse Delhi', 'Mumbai Hub', 'Pune Hub', 'Local Delivery'] },
    '380001': { city: 'Ahmedabad', state: 'Gujarat', days: 2, route: ['Warehouse Delhi', 'Ahmedabad Hub', 'Local Delivery'] }
  };

  const checkDelivery = () => {
    const route = deliveryRoutes[deliveryData.pincode];
    if (route) {
      setDeliveryData({
        ...deliveryData,
        city: route.city,
        state: route.state,
        estimatedDays: route.days,
        route: route.route
      });
    } else {
      setDeliveryData({
        ...deliveryData,
        city: 'Available',
        state: 'India',
        estimatedDays: 5,
        route: ['Warehouse Delhi', 'Regional Hub', 'Local Hub', 'Local Delivery']
      });
    }
  };

  const trackOrder = () => {
    setIsTrackingOrder(true);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const isEligibleForFreeDelivery = cartTotal >= 500;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delivery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚚 Free Delivery Information</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Free Delivery Eligibility */}
          <div className="delivery-eligibility">
            <div className={`eligibility-badge ${isEligibleForFreeDelivery ? 'eligible' : 'not-eligible'}`}>
              {isEligibleForFreeDelivery ? (
                <>✅ You qualify for FREE delivery!</>
              ) : (
                <>⚠️ Add ₹{500 - cartTotal} more for FREE delivery</>
              )}
            </div>
          </div>

          {/* Pincode Checker */}
          <div className="pincode-section">
            <h3>📍 Check Delivery to Your Location</h3>
            <div className="pincode-input-group">
              <input
                type="text"
                placeholder="Enter your pincode"
                value={deliveryData.pincode}
                onChange={(e) => setDeliveryData({...deliveryData, pincode: e.target.value})}
                maxLength="6"
              />
              <button onClick={checkDelivery} className="check-btn">Check</button>
            </div>
          </div>

          {/* Delivery Information */}
          {deliveryData.estimatedDays && (
            <div className="delivery-info">
              <div className="delivery-details">
                <h4>📦 Delivery Details</h4>
                <div className="detail-row">
                  <span>Location:</span>
                  <span>{deliveryData.city}, {deliveryData.state}</span>
                </div>
                <div className="detail-row">
                  <span>Estimated Delivery:</span>
                  <span>{deliveryData.estimatedDays} {deliveryData.estimatedDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="detail-row">
                  <span>Delivery Cost:</span>
                  <span className="free-text">FREE</span>
                </div>
              </div>

              {/* Route Map */}
              <div className="route-map">
                <h4>🗺️ Delivery Route</h4>
                <div className="route-steps">
                  {deliveryData.route.map((step, index) => (
                    <div key={index} className="route-step">
                      <div className="step-number">{index + 1}</div>
                      <div className="step-info">
                        <span className="step-name">{step}</span>
                        {index === 0 && <span className="step-time">Day 0 (Dispatch)</span>}
                        {index === deliveryData.route.length - 1 && (
                          <span className="step-time">Day {deliveryData.estimatedDays} (Delivery)</span>
                        )}
                        {index > 0 && index < deliveryData.route.length - 1 && (
                          <span className="step-time">Day {Math.ceil((index / deliveryData.route.length) * deliveryData.estimatedDays)}</span>
                        )}
                      </div>
                      {index < deliveryData.route.length - 1 && <div className="route-line"></div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Track Order Button */}
              <div className="track-section">
                <button onClick={trackOrder} className="track-btn">
                  📱 Track Your Order
                </button>
              </div>
            </div>
          )}

          {/* Order Tracking */}
          {isTrackingOrder && (
            <div className="tracking-info">
              <h4>📱 Order Tracking</h4>
              <div className="tracking-message">
                <p>🎉 Great! Once you place your order, you'll receive:</p>
                <ul>
                  <li>📧 Email confirmation with tracking number</li>
                  <li>📱 SMS updates on delivery progress</li>
                  <li>🔗 Real-time tracking link</li>
                  <li>📞 Delivery partner contact details</li>
                </ul>
                <p className="tracking-note">
                  💡 <strong>Tip:</strong> You can track your order anytime from your profile → Orders section
                </p>
              </div>
            </div>
          )}

          {/* Delivery Features */}
          <div className="delivery-features">
            <h4>✨ Delivery Features</h4>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">📦</span>
                <span>Secure Packaging</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Contact-less Delivery</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⏰</span>
                <span>Flexible Timing</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📞</span>
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryModal;