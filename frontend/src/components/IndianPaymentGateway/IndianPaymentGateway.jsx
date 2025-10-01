import React, { useState } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { toast } from 'react-toastify';
import './IndianPaymentGateway.css';

const IndianPaymentGateway = ({ onClose, onSuccess }) => {
  const { cart, cartTotal, formatPrice, clearCart } = useMarketplace();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // UPI Payment Options
  const UPI_APPS = [
    { id: 'googlepay', name: 'Google Pay', icon: '🔵', color: '#4285f4' },
    { id: 'phonepe', name: 'PhonePe', icon: '🟣', color: '#5f259f' },
    { id: 'paytm', name: 'Paytm', icon: '🔵', color: '#00baf2' },
    { id: 'bhim', name: 'BHIM UPI', icon: '🟠', color: '#ff6900' },
    { id: 'amazonpay', name: 'Amazon Pay', icon: '🟠', color: '#ff9900' }
  ];

  // Card/Banking Options
  const OTHER_METHODS = [
    { id: 'cards', name: 'Credit/Debit Cards', icon: '💳', description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', description: 'All major banks supported' },
    { id: 'wallet', name: 'Digital Wallets', icon: '👛', description: 'Paytm Wallet, Amazon Pay' },
    { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when order arrives' }
  ];

  const handleUPIPayment = async (app) => {
    setIsProcessing(true);
    
    try {
      // Generate UPI payment URL
      const merchantVPA = 'agriguru@paytm'; // Your merchant UPI ID
      const amount = cartTotal;
      const txnId = 'AG' + Date.now();
      const txnNote = 'AgriGuru Purchase';
      
      // UPI URL format
      const upiUrl = `upi://pay?pa=${merchantVPA}&pn=AgriGuru&tn=${txnNote}&am=${amount}&cu=INR&tr=${txnId}`;
      
      // Different app-specific URLs
      const appUrls = {
        googlepay: `tez://upi/pay?pa=${merchantVPA}&pn=AgriGuru&tn=${txnNote}&am=${amount}&cu=INR&tr=${txnId}`,
        phonepe: `phonepe://pay?pa=${merchantVPA}&pn=AgriGuru&tn=${txnNote}&am=${amount}&cu=INR&tr=${txnId}`,
        paytm: `paytmmp://pay?pa=${merchantVPA}&pn=AgriGuru&tn=${txnNote}&am=${amount}&cu=INR&tr=${txnId}`,
        bhim: `bhim://pay?pa=${merchantVPA}&pn=AgriGuru&tn=${txnNote}&am=${amount}&cu=INR&tr=${txnId}`,
        amazonpay: upiUrl
      };

      // Try to open the specific app
      const paymentUrl = appUrls[app] || upiUrl;
      
      // Create temporary link and click it
      const link = document.createElement('a');
      link.href = paymentUrl;
      link.click();
      
      // Simulate payment verification (in real app, verify via server)
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        if (success) {
          setTransactionId(txnId);
          setPaymentSuccess(true);
          clearCart();
          toast.success('Payment successful!');
          if (onSuccess) onSuccess();
        } else {
          toast.error('Payment failed. Please try again.');
        }
        setIsProcessing(false);
      }, 3000);
      
    } catch (error) {
      console.error('UPI payment error:', error);
      toast.error('Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  const handleOtherPayment = async (method) => {
    setIsProcessing(true);
    
    try {
      // Simulate different payment methods
      switch (method) {
        case 'cards':
          // In real app, integrate with Razorpay/PayU for cards
          window.open(`https://razorpay.com/payment-link/`, '_blank');
          break;
          
        case 'netbanking':
          // Redirect to net banking gateway
          window.open(`https://netbanking.example.com/pay?amount=${cartTotal}`, '_blank');
          break;
          
        case 'wallet':
          // Open wallet payment
          window.open(`https://paytm.com/pay?amount=${cartTotal}`, '_blank');
          break;
          
        case 'cod':
          // Cash on delivery - no payment needed now
          setTransactionId('COD' + Date.now());
          setPaymentSuccess(true);
          clearCart();
          toast.success('Order placed! Pay cash on delivery.');
          if (onSuccess) onSuccess();
          setIsProcessing(false);
          return;
      }
      
      // Simulate payment verification for other methods
      setTimeout(() => {
        const success = Math.random() > 0.1;
        
        if (success) {
          setTransactionId('PAY' + Date.now());
          setPaymentSuccess(true);
          clearCart();
          toast.success('Payment successful!');
          if (onSuccess) onSuccess();
        } else {
          toast.error('Payment failed. Please try again.');
        }
        setIsProcessing(false);
      }, 4000);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="payment-gateway-overlay">
        <div className="payment-gateway-modal success">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Your order has been placed successfully.</p>
            
            <div className="transaction-details">
              <div className="detail-row">
                <span>Transaction ID:</span>
                <span className="txn-id">{transactionId}</span>
              </div>
              <div className="detail-row">
                <span>Amount Paid:</span>
                <span className="amount">{formatPrice(cartTotal)}</span>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className="status success">Completed</span>
              </div>
            </div>
            
            <div className="success-actions">
              <button onClick={onClose} className="continue-btn">
                Continue Shopping
              </button>
              <button 
                onClick={() => window.print()} 
                className="print-btn"
              >
                📄 Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-gateway-overlay">
      <div className="payment-gateway-modal">
        <div className="modal-header">
          <h2>💳 Choose Payment Method</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.map(item => (
                <div key={item.id} className="summary-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                    <p className="item-price">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="total-amount">
              <strong>Total: {formatPrice(cartTotal)}</strong>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="payment-tabs">
            <button 
              className={`tab ${selectedPaymentMethod === 'upi' ? 'active' : ''}`}
              onClick={() => setSelectedPaymentMethod('upi')}
            >
              📱 UPI
            </button>
            <button 
              className={`tab ${selectedPaymentMethod === 'others' ? 'active' : ''}`}
              onClick={() => setSelectedPaymentMethod('others')}
            >
              💳 Others
            </button>
          </div>

          {/* UPI Payment Options */}
          {selectedPaymentMethod === 'upi' && (
            <div className="payment-section">
              <h3>🚀 Pay with UPI</h3>
              <p className="section-description">Choose your preferred UPI app:</p>
              
              <div className="upi-apps">
                {UPI_APPS.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleUPIPayment(app.id)}
                    disabled={isProcessing}
                    className="upi-app-btn"
                    style={{ borderLeftColor: app.color }}
                  >
                    <div className="app-icon">{app.icon}</div>
                    <div className="app-name">{app.name}</div>
                    {isProcessing && <div className="loading">⏳</div>}
                  </button>
                ))}
              </div>
              
              <div className="upi-note">
                <p>💡 <strong>Note:</strong> You'll be redirected to your UPI app to complete payment</p>
              </div>
            </div>
          )}

          {/* Other Payment Methods */}
          {selectedPaymentMethod === 'others' && (
            <div className="payment-section">
              <h3>💳 Other Payment Methods</h3>
              
              <div className="other-methods">
                {OTHER_METHODS.map(method => (
                  <button
                    key={method.id}
                    onClick={() => handleOtherPayment(method.id)}
                    disabled={isProcessing}
                    className="payment-method-btn"
                  >
                    <div className="method-icon">{method.icon}</div>
                    <div className="method-details">
                      <h4>{method.name}</h4>
                      <p>{method.description}</p>
                    </div>
                    {isProcessing && <div className="loading">⏳</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="security-info">
            <div className="security-item">
              🔒 Secure & encrypted payments
            </div>
            <div className="security-item">
              🛡️ Bank-level security standards
            </div>
            <div className="security-item">
              ⚡ Instant payment confirmation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndianPaymentGateway;