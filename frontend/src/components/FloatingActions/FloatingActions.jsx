import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import './FloatingActions.css';

const FloatingActions = () => {
  const { cartItemCount, favoritesCount } = useMarketplace();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Show/hide based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Don't show on marketplace page (to avoid duplication)
  const currentPath = window.location.pathname;
  if (currentPath === '/marketplace' || currentPath === '/cart' || currentPath === '/favorites' || currentPath === '/checkout') {
    return null;
  }

  if (!isVisible) return null;

  return (
    <div className="floating-actions">
      <div className={`floating-menu ${isExpanded ? 'expanded' : ''}`}>
        {/* Marketplace Link */}
        <Link to="/marketplace" className="floating-btn marketplace-btn" title="Browse Marketplace">
          <span className="btn-icon">🏪</span>
          <span className="btn-text">Shop</span>
        </Link>

        {/* Favorites Link */}
        {favoritesCount > 0 && (
          <Link to="/favorites" className="floating-btn favorites-btn" title="View Favorites">
            <span className="btn-icon">❤️</span>
            <span className="btn-text">Favorites</span>
            <span className="floating-badge">{favoritesCount}</span>
          </Link>
        )}

        {/* Cart Link */}
        {cartItemCount > 0 && (
          <Link to="/cart" className="floating-btn cart-btn" title="View Cart">
            <span className="btn-icon">🛒</span>
            <span className="btn-text">Cart</span>
            <span className="floating-badge">{cartItemCount}</span>
          </Link>
        )}
      </div>

      {/* Toggle Button */}
      <button
        className={`floating-toggle ${isExpanded ? 'active' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Close menu' : 'Open menu'}
      >
        {isExpanded ? '✕' : '🛍️'}
      </button>
    </div>
  );
};

export default FloatingActions;