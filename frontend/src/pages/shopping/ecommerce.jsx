import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './ecommerce.css';

const Ecommerce = () => {
  const { t } = useTranslation('common');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState([]);

  // Sample farming equipment data
  const products = [
    // Tractors
    {
      id: 1,
      name: 'Mahindra 275 DI ECO Tractor',
      category: 'tractors',
      price: 750000,
      originalPrice: 800000,
      image: '/api/placeholder/300/200',
      rating: 4.5,
      reviews: 128,
      description: '39 HP, 3 Cylinder, Water Cooled Engine',
      specifications: ['39 HP Engine', '3 Cylinder', 'Water Cooled', '540 RPM PTO'],
      inStock: true,
      brand: 'Mahindra'
    },
    {
      id: 2,
      name: 'John Deere 5050D Tractor',
      category: 'tractors',
      price: 850000,
      originalPrice: 900000,
      image: '/api/placeholder/300/200',
      rating: 4.7,
      reviews: 95,
      description: '50 HP, 4 Cylinder Diesel Engine',
      specifications: ['50 HP Engine', '4 Cylinder', 'Power Steering', '8F+2R Transmission'],
      inStock: true,
      brand: 'John Deere'
    },
    {
      id: 3,
      name: 'Swaraj 744 FE Tractor',
      category: 'tractors',
      price: 680000,
      originalPrice: 720000,
      image: '/api/placeholder/300/200',
      rating: 4.2,
      reviews: 67,
      description: '50 HP, 3 Cylinder, Oil Immersed Brakes',
      specifications: ['50 HP Engine', '3 Cylinder', 'Oil Immersed Brakes', '12F+3R Gearbox'],
      inStock: true,
      brand: 'Swaraj'
    },

    // Fertilizers
    {
      id: 4,
      name: 'NPK 19:19:19 Complex Fertilizer',
      category: 'fertilizers',
      price: 1200,
      originalPrice: 1400,
      image: '/api/placeholder/300/200',
      rating: 4.4,
      reviews: 234,
      description: 'Balanced NPK fertilizer for all crops - 50kg bag',
      specifications: ['19% Nitrogen', '19% Phosphorus', '19% Potassium', '50kg Pack'],
      inStock: true,
      brand: 'IFFCO'
    },
    {
      id: 5,
      name: 'Urea Fertilizer (46% N)',
      category: 'fertilizers',
      price: 850,
      originalPrice: 950,
      image: '/api/placeholder/300/200',
      rating: 4.3,
      reviews: 189,
      description: 'High nitrogen content urea fertilizer - 50kg bag',
      specifications: ['46% Nitrogen', 'White Granules', 'Quick Release', '50kg Pack'],
      inStock: true,
      brand: 'KRIBHCO'
    },
    {
      id: 6,
      name: 'DAP Fertilizer (18:46:0)',
      category: 'fertilizers',
      price: 1350,
      originalPrice: 1500,
      image: '/api/placeholder/300/200',
      rating: 4.5,
      reviews: 156,
      description: 'Di-Ammonium Phosphate fertilizer - 50kg bag',
      specifications: ['18% Nitrogen', '46% Phosphorus', 'Granular Form', '50kg Pack'],
      inStock: true,
      brand: 'NFL'
    },

    // Seeds
    {
      id: 7,
      name: 'Hybrid Corn Seeds (Pioneer)',
      category: 'seeds',
      price: 4500,
      originalPrice: 5000,
      image: '/api/placeholder/300/200',
      rating: 4.6,
      reviews: 78,
      description: 'High yielding hybrid corn seeds - 10kg pack',
      specifications: ['Hybrid Variety', 'High Yield', 'Disease Resistant', '10kg Pack'],
      inStock: true,
      brand: 'Pioneer'
    },
    {
      id: 8,
      name: 'Basmati Rice Seeds (Pusa 1121)',
      category: 'seeds',
      price: 3200,
      originalPrice: 3600,
      image: '/api/placeholder/300/200',
      rating: 4.4,
      reviews: 102,
      description: 'Premium Basmati rice seeds - 25kg pack',
      specifications: ['Basmati Variety', 'Long Grain', 'Aromatic', '25kg Pack'],
      inStock: true,
      brand: 'IARI'
    },

    // Tools
    {
      id: 9,
      name: 'Power Tiller (8 HP)',
      category: 'tools',
      price: 85000,
      originalPrice: 95000,
      image: '/api/placeholder/300/200',
      rating: 4.3,
      reviews: 45,
      description: '8 HP Diesel Power Tiller for small farms',
      specifications: ['8 HP Engine', 'Diesel Powered', 'Rotary Tiller', '600mm Width'],
      inStock: true,
      brand: 'VST'
    },
    {
      id: 10,
      name: 'Sprayer Pump (2 Stroke)',
      category: 'tools',
      price: 12500,
      originalPrice: 14000,
      image: '/api/placeholder/300/200',
      rating: 4.1,
      reviews: 89,
      description: '2 Stroke petrol sprayer for pesticide application',
      specifications: ['2 Stroke Engine', 'Petrol Powered', '20L Tank', 'Adjustable Nozzle'],
      inStock: true,
      brand: 'Honda'
    },

    // Irrigation
    {
      id: 11,
      name: 'Drip Irrigation Kit (1 Acre)',
      category: 'irrigation',
      price: 25000,
      originalPrice: 28000,
      image: '/api/placeholder/300/200',
      rating: 4.5,
      reviews: 67,
      description: 'Complete drip irrigation system for 1 acre',
      specifications: ['1 Acre Coverage', 'Complete Kit', 'Water Saving', 'Easy Installation'],
      inStock: true,
      brand: 'Netafim'
    },
    {
      id: 12,
      name: 'Submersible Water Pump (5 HP)',
      category: 'irrigation',
      price: 35000,
      originalPrice: 38000,
      image: '/api/placeholder/300/200',
      rating: 4.4,
      reviews: 123,
      description: '5 HP submersible pump for deep bore wells',
      specifications: ['5 HP Motor', 'Submersible', 'High Head', 'Corrosion Resistant'],
      inStock: true,
      brand: 'Crompton'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: '🏪' },
    { id: 'tractors', name: 'Tractors', icon: '🚜' },
    { id: 'fertilizers', name: 'Fertilizers', icon: '🧪' },
    { id: 'seeds', name: 'Seeds', icon: '🌱' },
    { id: 'tools', name: 'Tools', icon: '🔧' },
    { id: 'irrigation', name: 'Irrigation', icon: '💧' }
  ];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Add to cart function
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Format price in Indian currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculate discount percentage
  const getDiscount = (original, current) => {
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div className="ecommerce-container">
      {/* Header */}
      <div className="ecommerce-header">
        <div className="header-content">
          <h1>🌾 AgriGuru Marketplace</h1>
          <p>Your one-stop shop for all farming equipment and supplies</p>
          
          {/* Search and Filters */}
          <div className="search-filter-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search for tractors, fertilizers, seeds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="sort-dropdown">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {cart.length > 0 && (
              <div className="cart-indicator">
                🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ecommerce-main">
        {/* Sidebar Categories */}
        <div className="sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Featured Brands */}
          <div className="featured-brands">
            <h4>Featured Brands</h4>
            <div className="brand-list">
              <div className="brand-item">Mahindra</div>
              <div className="brand-item">John Deere</div>
              <div className="brand-item">IFFCO</div>
              <div className="brand-item">Pioneer</div>
              <div className="brand-item">VST</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-section">
          <div className="products-header">
            <h2>
              {selectedCategory === 'all' ? 'All Products' : 
               categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p>{filteredProducts.length} products found</p>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  {getDiscount(product.originalPrice, product.price) > 0 && (
                    <div className="discount-badge">
                      {getDiscount(product.originalPrice, product.price)}% OFF
                    </div>
                  )}
                  <div className="product-overlay">
                    <button className="quick-view-btn">Quick View</button>
                  </div>
                </div>

                <div className="product-info">
                  <div className="product-brand">{product.brand}</div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-specs">
                    {product.specifications.slice(0, 2).map((spec, index) => (
                      <span key={index} className="spec-tag">{spec}</span>
                    ))}
                  </div>

                  <div className="product-rating">
                    <div className="stars">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span className="rating-text">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="product-pricing">
                    <div className="current-price">{formatPrice(product.price)}</div>
                    {product.originalPrice > product.price && (
                      <div className="original-price">{formatPrice(product.originalPrice)}</div>
                    )}
                  </div>

                  <div className="product-actions">
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                    >
                      {product.inStock ? '🛒 Add to Cart' : 'Out of Stock'}
                    </button>
                    <button className="wishlist-btn">❤️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Benefits */}
      <div className="benefits-section">
        <div className="benefit-item">
          <span className="benefit-icon">🚚</span>
          <span className="benefit-text">Free Delivery</span>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">🔄</span>
          <span className="benefit-text">Easy Returns</span>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">💳</span>
          <span className="benefit-text">EMI Available</span>
        </div>
        <div className="benefit-item">
          <span className="benefit-icon">📞</span>
          <span className="benefit-text">24/7 Support</span>
        </div>
      </div>
    </div>
  );
};

export default Ecommerce;