import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './KhetiSaathFavorites.css';

const KhetiSaathFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('khetiSaathFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Modal control functions
  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  // Remove from favorites
  const removeFromFavorites = (itemId) => {
    const newFavorites = favorites.filter(fav => fav.id !== itemId);
    setFavorites(newFavorites);
    localStorage.setItem('khetiSaathFavorites', JSON.stringify(newFavorites));
    
    // Close modal if the removed item was open
    if (selectedItem && selectedItem.id === itemId) {
      closeModal();
    }
  };

  // Clear all favorites
  const clearAllFavorites = () => {
    if (window.confirm('Are you sure you want to remove all favorites?')) {
      setFavorites([]);
      localStorage.removeItem('khetiSaathFavorites');
      closeModal();
      alert('🗑️ All favorites cleared!');
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isModalOpen]);

  return (
    <div className="favorites-page">
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <h1>❤️ My Kheti Saath Favorites</h1>
            <p>Your saved farming tools, techniques, and homemade solutions</p>
            <Link to="/kheti-saath" className="back-btn">
              ← Back to Kheti Saath
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        {favorites.length === 0 ? (
          // Empty state
          <div className="empty-favorites">
            <div className="empty-icon">💔</div>
            <h2>No Favorites Yet</h2>
            <p>Start adding your favorite farming tools and techniques from Kheti Saath!</p>
            <Link to="/kheti-saath" className="browse-btn">
              Browse Kheti Saath
            </Link>
          </div>
        ) : (
          <>
            {/* Favorites Header */}
            <div className="favorites-header">
              <div className="favorites-count">
                <h2>
                  <span className="count-badge">{favorites.length}</span>
                  Favorite{favorites.length !== 1 ? 's' : ''} Saved
                </h2>
              </div>
              <button className="clear-all-btn" onClick={clearAllFavorites}>
                🗑️ Clear All
              </button>
            </div>

            {/* Favorites Grid */}
            <div className="favorites-grid">
              {favorites.map(item => (
                <div key={item.id} className="favorite-card" data-category={item.category}>
                  <div className="item-header">
                    <div className="item-image">{item.image}</div>
                    <div className="item-category">{item.category}</div>
                    <button 
                      className="remove-favorite-btn"
                      onClick={() => removeFromFavorites(item.id)}
                      title="Remove from favorites"
                    >
                      ❌
                    </button>
                  </div>
                  
                  <div className="item-content">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-description">{item.description}</p>
                    
                    <div className="usage-preview">
                      <h4>📋 Quick Usage:</h4>
                      <ol className="usage-list">
                        {item.usageInstructions.slice(0, 2).map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                      {item.usageInstructions.length > 2 && (
                        <p className="more-steps">...and {item.usageInstructions.length - 2} more steps</p>
                      )}
                    </div>

                    <div className="card-actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => openModal(item)}
                      >
                        View Full Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal for full details */}
      {isModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedItem.name}</h2>
              <button className="modal-close-btn" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-item-info">
                <div className="modal-item-image">{selectedItem.image}</div>
                <div className="modal-item-details">
                  <span className="modal-category">{selectedItem.category}</span>
                  <p className="modal-description">{selectedItem.description}</p>
                </div>
              </div>

              <div className="modal-section">
                <h3>📋 Complete Usage Instructions:</h3>
                <ol className="modal-usage-list">
                  {selectedItem.usageInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="modal-section safety-section">
                <h3>⚠️ Safety Tips:</h3>
                <div className="safety-tips">
                  <p>{selectedItem.safetyTips}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-action-btn danger"
                onClick={() => removeFromFavorites(selectedItem.id)}
              >
                ❌ Remove from Favorites
              </button>
              <button className="modal-action-btn secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KhetiSaathFavorites;