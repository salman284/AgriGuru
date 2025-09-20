import React from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import './QuickView.css';

const QuickView = ({ product, onClose }) => {
  const { 
    addToCart, 
    toggleFavorite, 
    isInCart, 
    isInFavorites, 
    formatPrice,
    getDiscount 
  } = useMarketplace();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product);
  };

  const discount = getDiscount(product.originalPrice, product.price);

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="quick-view-close" onClick={onClose}>×</button>
        
        <div className="quick-view-content">
          {/* Product Image Section */}
          <div className="quick-view-image">
            <img src={product.image} alt={product.name} />
            {discount > 0 && (
              <div className="quick-view-discount-badge">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="quick-view-details">
            <div className="quick-view-header">
              <div className="product-brand-large">{product.brand}</div>
              <h2 className="product-name-large">{product.name}</h2>
              <p className="product-description-large">{product.description}</p>
            </div>

            {/* Product Rating */}
            <div className="quick-view-rating">
              <div className="stars-large">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span className="rating-text-large">
                {product.rating} ({product.reviews || 102} reviews)
              </span>
            </div>

            {/* Product Specifications */}
            <div className="quick-view-specs">
              <h4>Specifications:</h4>
              <div className="specs-list">
                {product.specifications.map((spec, index) => (
                  <span key={index} className="spec-tag-large">{spec}</span>
                ))}
              </div>
            </div>

            {/* Product Features */}
            {product.features && (
              <div className="quick-view-features">
                <h4>Key Features:</h4>
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Price Section */}
            <div className="quick-view-pricing">
              <div className="price-section">
                <span className="current-price-large">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="original-price-large">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              {discount > 0 && (
                <div className="savings-text">
                  You save {formatPrice(product.originalPrice - product.price)} ({discount}% off)
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="quick-view-stock">
              {product.inStock ? (
                <span className="in-stock">✅ In Stock</span>
              ) : (
                <span className="out-of-stock">❌ Out of Stock</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="quick-view-actions">
              <button 
                className={`quick-view-cart-btn ${isInCart(product.id) ? 'in-cart' : ''}`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {isInCart(product.id) ? '✓ Added to Cart' : '🛒 Add to Cart'}
              </button>
              
              <button 
                className={`quick-view-favorite-btn ${isInFavorites(product.id) ? 'favorited' : ''}`}
                onClick={handleToggleFavorite}
              >
                {isInFavorites(product.id) ? '💖 Favorited' : '🤍 Add to Favorites'}
              </button>
            </div>

            {/* Additional Info */}
            <div className="quick-view-info">
              <div className="info-item">
                <span className="info-icon">🚚</span>
                <span>Free delivery on orders above ₹500</span>
              </div>
              <div className="info-item">
                <span className="info-icon">↩️</span>
                <span>30-day easy returns</span>
              </div>
              <div className="info-item">
                <span className="info-icon">🔒</span>
                <span>Secure payment options</span>
              </div>
              <div className="info-item">
                <span className="info-icon">📞</span>
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;