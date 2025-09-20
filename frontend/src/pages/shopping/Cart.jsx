import React from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import './Cart.css';

const Cart = () => {
  const {
    cart,
    cartTotal,
    cartItemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
    addToFavorites,
    isInFavorites
  } = useMarketplace();

  // Handle quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  // Handle remove item
  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  // Handle move to favorites
  const handleMoveToFavorites = (product) => {
    if (!isInFavorites(product.id)) {
      addToFavorites(product);
    }
    removeFromCart(product.id);
  };

  // Calculate subtotal for individual item
  const getItemSubtotal = (item) => {
    return item.price * item.quantity;
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1>🛒 Your Shopping Cart</h1>
          <p>Your cart is currently empty</p>
        </div>
        
        <div className="empty-cart">
          <div className="empty-cart-icon">
            🛒
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/marketplace" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div className="cart-title-section">
          <h1>🛒 Your Shopping Cart</h1>
          <p>{cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in your cart</p>
        </div>
        <div className="cart-actions">
          <Link to="/marketplace" className="continue-shopping-link">
            ← Continue Shopping
          </Link>
          <button 
            onClick={clearCart} 
            className="clear-cart-btn"
            title="Clear all items"
          >
            🗑️ Clear Cart
          </button>
        </div>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          <div className="cart-items-header">
            <h3>Items in Cart</h3>
          </div>
          
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              
              <div className="item-details">
                <h4 className="item-name">{item.name}</h4>
                <p className="item-brand">{item.brand}</p>
                <p className="item-description">{item.description}</p>
                
                <div className="item-actions">
                  <button
                    onClick={() => handleMoveToFavorites(item)}
                    className="move-to-favorites-btn"
                    title="Move to favorites"
                  >
                    ❤️ Save for later
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="remove-item-btn"
                    title="Remove from cart"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
              
              <div className="item-quantity">
                <label htmlFor={`quantity-${item.id}`}>Quantity:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="quantity-btn"
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    id={`quantity-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                    className="quantity-input"
                  />
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="item-pricing">
                <div className="item-unit-price">
                  <span className="price-label">Unit Price:</span>
                  <span className="price-value">{formatPrice(item.price)}</span>
                </div>
                <div className="item-subtotal">
                  <span className="price-label">Subtotal:</span>
                  <span className="price-value">{formatPrice(getItemSubtotal(item))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-line">
                <span>Items ({cartItemCount}):</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping:</span>
                <span className="free-shipping">FREE</span>
              </div>
              <div className="summary-line">
                <span>Tax:</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-line total-line">
                <span>Total:</span>
                <span className="total-amount">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <div className="checkout-actions">
              <Link to="/checkout" className="checkout-btn">
                🚀 Proceed to Checkout
              </Link>
              <Link to="/favorites" className="view-favorites-btn">
                ❤️ View Favorites
              </Link>
            </div>

            <div className="security-info">
              <div className="security-item">
                🔒 Secure checkout
              </div>
              <div className="security-item">
                🚚 Free delivery on orders above ₹1000
              </div>
              <div className="security-item">
                🔄 Easy returns within 30 days
              </div>
            </div>
          </div>

          <div className="recommendations">
            <h4>Frequently bought together</h4>
            <p>Add these items to complete your farming setup:</p>
            <div className="recommendation-list">
              <div className="recommendation-item">
                <span>🧪</span>
                <span>Organic Fertilizer</span>
              </div>
              <div className="recommendation-item">
                <span>🌱</span>
                <span>Premium Seeds</span>
              </div>
              <div className="recommendation-item">
                <span>💧</span>
                <span>Irrigation Kit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;