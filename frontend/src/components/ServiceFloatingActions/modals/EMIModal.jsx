import React, { useState } from 'react';
import './ModalStyles.css';

const EMIModal = ({ onClose, cart }) => {
  const [emiData, setEmiData] = useState({
    amount: 0,
    tenure: 6,
    interestRate: 12,
    monthlyEmi: 0,
    totalAmount: 0,
    provider: 'bajaj'
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  // EMI providers with their rates
  const emiProviders = [
    { id: 'bajaj', name: 'Bajaj Finserv', rate: 12, minAmount: 1000, logo: '🏦' },
    { id: 'hdfc', name: 'HDFC Bank', rate: 13.5, minAmount: 2000, logo: '🏛️' },
    { id: 'icici', name: 'ICICI Bank', rate: 14, minAmount: 2000, logo: '🏢' },
    { id: 'axis', name: 'Axis Bank', rate: 14.5, minAmount: 1500, logo: '🏪' },
    { id: 'sbi', name: 'State Bank of India', rate: 13, minAmount: 3000, logo: '🏛️' },
    { id: 'kotak', name: 'Kotak Mahindra', rate: 15, minAmount: 2500, logo: '🏢' }
  ];

  const tenureOptions = [3, 6, 9, 12, 18, 24, 36];

  // Calculate EMI
  const calculateEMI = (amount, rate, tenure) => {
    const monthlyRate = rate / (12 * 100);
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return emi;
  };

  // Handle amount selection
  const selectProduct = (product) => {
    const amount = product.price * product.quantity;
    setSelectedProduct(product);
    const provider = emiProviders.find(p => p.id === emiData.provider);
    const monthlyEmi = calculateEMI(amount, provider.rate, emiData.tenure);
    const totalAmount = monthlyEmi * emiData.tenure;
    
    setEmiData({
      ...emiData,
      amount,
      interestRate: provider.rate,
      monthlyEmi,
      totalAmount
    });
  };

  // Handle provider change
  const handleProviderChange = (providerId) => {
    const provider = emiProviders.find(p => p.id === providerId);
    if (emiData.amount >= provider.minAmount) {
      const monthlyEmi = calculateEMI(emiData.amount, provider.rate, emiData.tenure);
      const totalAmount = monthlyEmi * emiData.tenure;
      
      setEmiData({
        ...emiData,
        provider: providerId,
        interestRate: provider.rate,
        monthlyEmi,
        totalAmount
      });
    }
  };

  // Handle tenure change
  const handleTenureChange = (tenure) => {
    const provider = emiProviders.find(p => p.id === emiData.provider);
    const monthlyEmi = calculateEMI(emiData.amount, provider.rate, tenure);
    const totalAmount = monthlyEmi * tenure;
    
    setEmiData({
      ...emiData,
      tenure,
      monthlyEmi,
      totalAmount
    });
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const isEligibleForEMI = cartTotal >= 1000;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content emi-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💳 EMI Options Available</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* EMI Eligibility */}
          <div className="emi-eligibility">
            <div className={`eligibility-badge ${isEligibleForEMI ? 'eligible' : 'not-eligible'}`}>
              {isEligibleForEMI ? (
                <>✅ EMI available on your cart!</>
              ) : (
                <>⚠️ Minimum ₹1,000 required for EMI</>
              )}
            </div>
          </div>

          {isEligibleForEMI && (
            <>
              {/* Product Selection */}
              <div className="product-selection">
                <h3>📦 Select Product for EMI</h3>
                <div className="cart-items">
                  {cart.map(item => (
                    <div 
                      key={item.id} 
                      className={`cart-item ${selectedProduct?.id === item.id ? 'selected' : ''}`}
                      onClick={() => selectProduct(item)}
                    >
                      <img src={item.image} alt={item.name} className="item-image" />
                      <div className="item-details">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                        <span className="item-quantity">Qty: {item.quantity}</span>
                      </div>
                      {selectedProduct?.id === item.id && <span className="selected-indicator">✓</span>}
                    </div>
                  ))}
                  
                  {/* Total Cart Option */}
                  <div 
                    className={`cart-item total-option ${!selectedProduct ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedProduct(null);
                      const provider = emiProviders.find(p => p.id === emiData.provider);
                      const monthlyEmi = calculateEMI(cartTotal, provider.rate, emiData.tenure);
                      const totalAmount = monthlyEmi * emiData.tenure;
                      setEmiData({
                        ...emiData,
                        amount: cartTotal,
                        monthlyEmi,
                        totalAmount
                      });
                    }}
                  >
                    <div className="total-icon">🛒</div>
                    <div className="item-details">
                      <span className="item-name">Complete Cart</span>
                      <span className="item-price">₹{cartTotal.toLocaleString()}</span>
                      <span className="item-quantity">All items</span>
                    </div>
                    {!selectedProduct && <span className="selected-indicator">✓</span>}
                  </div>
                </div>
              </div>

              {emiData.amount > 0 && (
                <>
                  {/* EMI Provider Selection */}
                  <div className="provider-selection">
                    <h3>🏦 Choose EMI Provider</h3>
                    <div className="providers-grid">
                      {emiProviders.map(provider => (
                        <div 
                          key={provider.id}
                          className={`provider-card ${
                            emiData.provider === provider.id ? 'selected' : ''
                          } ${emiData.amount < provider.minAmount ? 'disabled' : ''}`}
                          onClick={() => emiData.amount >= provider.minAmount && handleProviderChange(provider.id)}
                        >
                          <div className="provider-logo">{provider.logo}</div>
                          <div className="provider-info">
                            <span className="provider-name">{provider.name}</span>
                            <span className="provider-rate">{provider.rate}% interest</span>
                            {emiData.amount < provider.minAmount && (
                              <span className="min-amount">Min: ₹{provider.minAmount.toLocaleString()}</span>
                            )}
                          </div>
                          {emiData.provider === provider.id && <span className="selected-indicator">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tenure Selection */}
                  <div className="tenure-selection">
                    <h3>📅 Select EMI Tenure</h3>
                    <div className="tenure-options">
                      {tenureOptions.map(months => (
                        <button
                          key={months}
                          className={`tenure-btn ${emiData.tenure === months ? 'selected' : ''}`}
                          onClick={() => handleTenureChange(months)}
                        >
                          {months} months
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* EMI Calculator */}
                  <div className="emi-calculator">
                    <h3>🧮 EMI Breakdown</h3>
                    <div className="calculation-details">
                      <div className="calc-row">
                        <span>Principal Amount:</span>
                        <span>₹{emiData.amount.toLocaleString()}</span>
                      </div>
                      <div className="calc-row">
                        <span>Interest Rate:</span>
                        <span>{emiData.interestRate}% per annum</span>
                      </div>
                      <div className="calc-row">
                        <span>Tenure:</span>
                        <span>{emiData.tenure} months</span>
                      </div>
                      <div className="calc-row highlighted">
                        <span>Monthly EMI:</span>
                        <span>₹{Math.round(emiData.monthlyEmi).toLocaleString()}</span>
                      </div>
                      <div className="calc-row">
                        <span>Total Amount:</span>
                        <span>₹{Math.round(emiData.totalAmount).toLocaleString()}</span>
                      </div>
                      <div className="calc-row">
                        <span>Total Interest:</span>
                        <span>₹{Math.round(emiData.totalAmount - emiData.amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* EMI Benefits */}
                  <div className="emi-benefits">
                    <h3>✨ EMI Benefits</h3>
                    <div className="benefits-grid">
                      <div className="benefit-item">
                        <span className="benefit-icon">⚡</span>
                        <span>Instant Approval</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">📋</span>
                        <span>Minimal Documentation</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">🔒</span>
                        <span>Secure Processing</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">💡</span>
                        <span>Flexible Tenure</span>
                      </div>
                    </div>
                  </div>

                  {/* Apply for EMI */}
                  <div className="emi-application">
                    <button className="apply-emi-btn">
                      💳 Apply for EMI (₹{Math.round(emiData.monthlyEmi).toLocaleString()}/month)
                    </button>
                    <p className="emi-note">
                      🔒 Your application will be processed securely. EMI approval subject to bank terms.
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* EMI Information */}
          <div className="emi-info">
            <h3>ℹ️ EMI Information</h3>
            <div className="info-items">
              <div className="info-item">
                <strong>Processing Time:</strong> Instant to 24 hours
              </div>
              <div className="info-item">
                <strong>Required Documents:</strong> ID proof, Income proof
              </div>
              <div className="info-item">
                <strong>Pre-payment:</strong> Allowed with minimal charges
              </div>
              <div className="info-item">
                <strong>Late Payment:</strong> ₹500 + GST penalty
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMIModal;