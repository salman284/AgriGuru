import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import DeliveryModal from './modals/DeliveryModal';
import ReturnsModal from './modals/ReturnsModal';
import EMIModal from './modals/EMIModal';
import SupportModal from './modals/SupportModal';
import './ServiceFloatingActions.css';

const ServiceFloatingActions = () => {
  const { cart } = useMarketplace();
  const [isVisible, setIsVisible] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Show/hide based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Don't show on pages where they might conflict with main content
  const currentPath = window.location.pathname;
  if (currentPath === '/checkout') {
    return null;
  }

  if (!isVisible) return null;

  return (
    <>
      <div className="service-floating-actions">
        {/* Free Delivery Button */}
        <button 
          className="service-btn delivery-btn"
          onClick={() => openModal('delivery')}
          title="Free Delivery"
        >
          <div className="service-icon">🚚</div>
          <span className="service-text">Free Delivery</span>
        </button>

        {/* Easy Returns Button */}
        <button 
          className="service-btn returns-btn"
          onClick={() => openModal('returns')}
          title="Easy Returns"
        >
          <div className="service-icon">↩️</div>
          <span className="service-text">Easy Returns</span>
        </button>

        {/* EMI Available Button */}
        <button 
          className="service-btn emi-btn"
          onClick={() => openModal('emi')}
          title="EMI Available"
        >
          <div className="service-icon">💳</div>
          <span className="service-text">EMI Available</span>
        </button>

        {/* 24/7 Support Button */}
        <button 
          className="service-btn support-btn"
          onClick={() => openModal('support')}
          title="24/7 Support"
        >
          <div className="service-icon">📞</div>
          <span className="service-text">24/7 Support</span>
        </button>
      </div>

      {/* Modals */}
      {activeModal === 'delivery' && (
        <DeliveryModal onClose={closeModal} cart={cart} />
      )}
      {activeModal === 'returns' && (
        <ReturnsModal onClose={closeModal} cart={cart} />
      )}
      {activeModal === 'emi' && (
        <EMIModal onClose={closeModal} cart={cart} />
      )}
      {activeModal === 'support' && (
        <SupportModal onClose={closeModal} />
      )}
    </>
  );
};

export default ServiceFloatingActions;