import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import './Favorites.css';

const Favorites = () => {
  const {
    favorites,
    favoritesCount,
    removeFromFavorites,
    addToCart,
    clearFavorites,
    formatPrice,
    isInCart,
    getDiscount
  } = useMarketplace();

  const [sortBy, setSortBy] = useState('recent');

  // Sort favorites based on selected option
  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default: // recent
        return 0; // Keep original order (most recent first)
    }
  });

  // Handle remove from favorites
  const handleRemoveFromFavorites = (productId) => {
    removeFromFavorites(productId);
  };

  // Handle add to cart from favorites
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  // Calculate total value of favorites
  const totalValue = favorites.reduce((sum, item) => sum + item.price, 0);

  if (favorites.length === 0) {
    return (
      <div className="favorites-container">
        <div className="favorites-header">
          <h1>❤️ Your Favorites</h1>
          <p>Your wishlist is currently empty</p>
        </div>
        
        <div className="empty-favorites">
          <div className="empty-favorites-icon">
            ❤️
          </div>
          <h2>No favorites yet</h2>
          <p>Start browsing and save items you love for later!</p>
          <Link to="/marketplace" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <div className="favorites-title-section">
          <h1>❤️ Your Favorites</h1>
          <p>{favoritesCount} item{favoritesCount !== 1 ? 's' : ''} in your wishlist</p>
        </div>
        <div className="favorites-actions">
          <Link to="/marketplace" className="continue-browsing-link">
            ← Continue Browsing
          </Link>
          <button 
            onClick={clearFavorites} 
            className="clear-favorites-btn"
            title="Clear all favorites"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      <div className="favorites-content">
        <div className="favorites-sidebar">
          <div className="favorites-stats">
            <h3>Wishlist Summary</h3>
            <div className="stat-item">
              <span className="stat-label">Total Items:</span>
              <span className="stat-value">{favoritesCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Value:</span>
              <span className="stat-value">{formatPrice(totalValue)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">In Cart:</span>
              <span className="stat-value">
                {favorites.filter(item => isInCart(item.id)).length}
              </span>
            </div>
          </div>

          <div className="favorites-controls">
            <h4>Sort by</h4>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Recently Added</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="quick-actions">
            <h4>Quick Actions</h4>
            <button
              onClick={() => {
                favorites.forEach(item => {
                  if (!isInCart(item.id)) {
                    addToCart(item);
                  }
                });
              }}
              className="add-all-to-cart-btn"
            >
              🛒 Add All to Cart
            </button>
            <Link to="/cart" className="view-cart-btn">
              👀 View Cart
            </Link>
          </div>
        </div>

        <div className="favorites-main">
          <div className="favorites-toolbar">
            <div className="view-options">
              <span>View:</span>
              <button className="view-btn active">
                <span>⊞</span> Grid
              </button>
              <button className="view-btn">
                <span>☰</span> List
              </button>
            </div>
          </div>

          <div className="favorites-grid">
            {sortedFavorites.map(product => (
              <div key={product.id} className="favorite-item">
                <div className="favorite-item-image">
                  <img src={product.image} alt={product.name} />
                  {getDiscount(product.originalPrice, product.price) > 0 && (
                    <div className="discount-badge">
                      {getDiscount(product.originalPrice, product.price)}% OFF
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFromFavorites(product.id)}
                    className="remove-favorite-btn"
                    title="Remove from favorites"
                  >
                    ❌
                  </button>
                </div>

                <div className="favorite-item-info">
                  <div className="product-brand">{product.brand}</div>
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-description">{product.description}</p>

                  {product.specifications && (
                    <div className="product-specs">
                      {product.specifications.slice(0, 2).map((spec, index) => (
                        <span key={index} className="spec-tag">{spec}</span>
                      ))}
                    </div>
                  )}

                  {product.rating && (
                    <div className="product-rating">
                      <div className="stars">
                        {'★'.repeat(Math.floor(product.rating))}
                        {'☆'.repeat(5 - Math.floor(product.rating))}
                      </div>
                      <span className="rating-text">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                  )}

                  <div className="product-pricing">
                    <div className="current-price">{formatPrice(product.price)}</div>
                    {product.originalPrice > product.price && (
                      <div className="original-price">{formatPrice(product.originalPrice)}</div>
                    )}
                  </div>

                  <div className="favorite-item-actions">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`add-to-cart-btn ${isInCart(product.id) ? 'in-cart' : ''}`}
                      disabled={!product.inStock}
                    >
                      {!product.inStock 
                        ? '❌ Out of Stock'
                        : isInCart(product.id) 
                          ? '✅ In Cart' 
                          : '🛒 Add to Cart'
                      }
                    </button>
                    <button
                      onClick={() => handleRemoveFromFavorites(product.id)}
                      className="remove-btn"
                      title="Remove from favorites"
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="favorites-suggestions">
        <h3>You might also like</h3>
        <p>Based on your favorites, here are some recommendations:</p>
        <div className="suggestion-categories">
          <div className="suggestion-category">
            <span className="category-icon">🚜</span>
            <span className="category-name">More Tractors</span>
          </div>
          <div className="suggestion-category">
            <span className="category-icon">🧪</span>
            <span className="category-name">Fertilizers</span>
          </div>
          <div className="suggestion-category">
            <span className="category-icon">🌱</span>
            <span className="category-name">Seeds</span>
          </div>
          <div className="suggestion-category">
            <span className="category-icon">🔧</span>
            <span className="category-name">Tools</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Favorites;