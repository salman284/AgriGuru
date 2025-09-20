import React, { useState } from 'react';
import './ServiceBenefits.css';

const ServiceBenefits = () => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 'delivery',
      icon: '🚚',
      title: 'Free Delivery',
      description: 'Free delivery on orders above ₹500',
      details: 'We provide free delivery on all orders above ₹500. Orders below ₹500 have a delivery charge of ₹50. Delivery within 3-5 business days.'
    },
    {
      id: 'returns',
      icon: '↩️',
      title: 'Easy Returns',
      description: '30-day hassle-free returns',
      details: 'Easy returns within 30 days of purchase. No questions asked policy for defective products. Return shipping is free for defective items.'
    },
    {
      id: 'emi',
      icon: '💳',
      title: 'EMI Available',
      description: 'Easy installments on all products',
      details: 'Convert your purchases into easy EMIs. Available for orders above ₹1000. 0% interest on 3 and 6 month EMIs. Partner banks: HDFC, ICICI, SBI.'
    },
    {
      id: 'support',
      icon: '📞',
      title: '24/7 Support',
      description: 'Round the clock customer support',
      details: 'Our customer support team is available 24/7 to help you. Contact us via phone, email, or chat for any queries or assistance.'
    }
  ];

  const openServiceModal = (service) => {
    setSelectedService(service);
  };

  const closeModal = () => {
    setSelectedService(null);
  };

  return (
    <>
      <div className="service-benefits">
        <h3 className="service-benefits-title">Our Services</h3>
        <div className="service-benefits-grid">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="service-benefit-card"
              onClick={() => openServiceModal(service)}
            >
              <div className="service-icon">{service.icon}</div>
              <div className="service-content">
                <h4 className="service-title">{service.title}</h4>
                <p className="service-description">{service.description}</p>
              </div>
              <div className="service-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="service-modal-overlay" onClick={closeModal}>
          <div className="service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="service-modal-header">
              <div className="service-modal-icon">{selectedService.icon}</div>
              <h2 className="service-modal-title">{selectedService.title}</h2>
              <button className="service-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="service-modal-content">
              <p className="service-modal-description">{selectedService.description}</p>
              <div className="service-modal-details">
                <h4>Details:</h4>
                <p>{selectedService.details}</p>
              </div>
              <div className="service-modal-actions">
                <button className="service-modal-btn primary" onClick={closeModal}>
                  Got it!
                </button>
                <button className="service-modal-btn secondary" onClick={closeModal}>
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceBenefits;