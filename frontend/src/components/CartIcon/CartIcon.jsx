import React from 'react';
import { Link } from 'react-router-dom';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import './CartIcon.css';

const CartIcon = () => {
  const { cartItemCount, favoritesCount } = useMarketplace();

  return (
    <div className="cart-icon-container">
      {/* Cart Icon */}
      <Link to="/cart" className="cart-icon-link" title="View Cart">
        <div className="cart-icon">
          🛒
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span>
          )}
        </div>
      </Link>

      {/* Favorites Icon */}
      <Link to="/favorites" className="favorites-icon-link" title="View Favorites">
        <div className="favorites-icon">
          ❤️
          {favoritesCount > 0 && (
            <span className="favorites-badge">{favoritesCount}</span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CartIcon;