import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import QuickView from '../../components/QuickView/QuickView';
import './ecommerce.css';

const Ecommerce = () => {
  const { user } = useAuth();
  const { 
    addToCart, 
    toggleFavorite, 
    isInCart, 
    isInFavorites, 
    cartItemCount, 
    favoritesCount,
    formatPrice,
    getDiscount 
  } = useMarketplace();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch farmer products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/products', {
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Transform backend products to match frontend format
          const transformedProducts = data.products.map(p => ({
            id: p.id,
            name: p.productName,
            category: 'farmer-products',
            price: p.price,
            originalPrice: p.price * 1.2, // 20% markup for display
            image: p.productImage || `${process.env.PUBLIC_URL}/images/products/placeholder.jpg`,
            rating: 4.5,
            reviews: p.views || 0,
            description: p.description,
            specifications: [
              p.organicCertified ? 'Organic Certified' : 'Farm Fresh',
              p.deliveryAvailable ? 'Delivery Available' : 'Pickup Only',
              `${p.quantity} ${p.unit} available`,
              p.location
            ],
            inStock: p.status === 'active',
            brand: p.farmerName,
            farmerProduct: true,
            location: p.location,
            phoneNumber: p.phoneNumber
          }));
          
          setProducts(transformedProducts);
        } else {
          setError(data.error || 'Failed to load products');
        }
      } catch (err) {
        console.error('❌ Error fetching products:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Equipment products (Tractors, Tools, Fertilizers, etc.) - Not farmer listings
  const equipmentProducts = [
    // Tractors
    {
      id: 1,
      name: 'Mahindra 275 DI ECO Tractor',
      category: 'tractors',
      price: 750000,
      originalPrice: 800000,
      image: `${process.env.PUBLIC_URL}/images/products/Mahindra tractor.jpg`,
      rating: 4.5,
      reviews: 128,
      description: '39 HP, 3 Cylinder, Water Cooled Engine',
      specifications: ['39 HP Engine', '3 Cylinder', 'Water Cooled', '540 RPM PTO'],
      features: [
        'Advanced transmission system for smooth operation',
        'Fuel-efficient engine design',
        'Comfortable operator cabin with ergonomic controls',
        'Heavy-duty hydraulic system',
        'Multi-speed PTO for various implements'
      ],
      inStock: true,
      brand: 'Mahindra'
    },
    {
      id: 2,
      name: 'John Deere 5050D Tractor',
      category: 'tractors',
      price: 850000,
      originalPrice: 900000,
      image: `${process.env.PUBLIC_URL}/images/products/5050D tractor.jpg`,
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
      image: `${process.env.PUBLIC_URL}/images/products/Swaraj 744 FE Tractor.jpg`,
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
      image: `${process.env.PUBLIC_URL}/images/products/NPK.jpg`,
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
      image: `${process.env.PUBLIC_URL}/images/products/UREA.jpg`,
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
      image: `${process.env.PUBLIC_URL}/images/products/DAP.jpg`,
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
      image: `${process.env.PUBLIC_URL}/images/products/Hybrid Corn seeds.jpg`,
      rating: 4.6,
      reviews: 78,
      description: 'High yielding hybrid corn seeds - 10kg pack',
      specifications: ['Hybrid Variety', 'High Yield', 'Disease Resistant', '10kg Pack'],
      features: [
        'Superior genetic traits for maximum yield',
        'Enhanced disease and pest resistance',
        'Adaptable to various soil conditions',
        'Consistent germination rate above 90%',
        'Suitable for both rain-fed and irrigated farming'
      ],
      inStock: true,
      brand: 'Pioneer'
    },
    {
      id: 8,
      name: 'Basmati Rice Seeds (Pusa 1121)',
      category: 'seeds',
      price: 3200,
      originalPrice: 3600,
      image: `${process.env.PUBLIC_URL}/images/products/Basmati Rice.jpg`,
      rating: 4.4,
      reviews: 102,
      description: 'Premium Basmati rice seeds - 25kg pack',
      specifications: ['Basmati Variety', 'Long Grain', 'Aromatic', '25kg Pack'],
      features: [
        'Premium long-grain basmati variety',
        'Excellent cooking quality with distinct aroma',
        'High market demand and premium pricing',
        'Suitable for export quality production',
        'Resistant to common rice diseases'
      ],
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
      image: `${process.env.PUBLIC_URL}/images/products/Power tiller 8hp.jpg`,
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
      image: `${process.env.PUBLIC_URL}/images/products/Sprayer pump.jpg`,
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
      image: `${process.env.PUBLIC_URL}/images/products/Drip irrigation kit.jpg`,
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
      image: `${process.env.PUBLIC_URL}/images/products/Submersible pump.jpg`,
      rating: 4.4,
      reviews: 123,
      description: '5 HP submersible pump for deep bore wells',
      specifications: ['5 HP Motor', 'Submersible', 'High Head', 'Corrosion Resistant'],
      inStock: true,
      brand: 'Crompton'
    }
  ];

  // Filter products based on user type
  const userType = user?.userType || 'customer';
  const isCustomer = userType === 'customer';
  
  // Customers only see farmer products, farmers see everything
  const allProducts = isCustomer 
    ? products  // Only farmer-listed products for customers
    : [...products, ...equipmentProducts];  // All products for farmers

  // Filter categories based on user type
  const allCategories = [
    { id: 'all', name: 'All Products', icon: '🏪' },
    { id: 'farmer-products', name: 'Fresh From Farmers', icon: '🌾' },
    { id: 'tractors', name: 'Tractors', icon: '🚜' },
    { id: 'fertilizers', name: 'Fertilizers', icon: '🧪' },
    { id: 'seeds', name: 'Seeds', icon: '🌱' },
    { id: 'tools', name: 'Tools', icon: '🔧' },
    { id: 'irrigation', name: 'Irrigation', icon: '💧' }
  ];
  
  // Customers only see farmer-products category
  const categories = isCustomer 
    ? allCategories.filter(cat => cat.id === 'all' || cat.id === 'farmer-products')
    : allCategories;

  // Filter and sort products
  const filteredProducts = allProducts
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

  // Show loading state
  if (loading) {
    return (
      <div className="ecommerce-container">
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>
          <p>⏳ Loading marketplace products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="ecommerce-container">
      {/* Header */}
      <div className="ecommerce-header">
        <div className="header-content">
          <h1>🌾 KisanMitra Marketplace</h1>
          <p>Your one-stop shop for all farming equipment and supplies</p>
          
          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              padding: '15px 20px',
              marginTop: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <h3 style={{ margin: 0, color: '#c00' }}>Error Loading Products</h3>
                <p style={{ margin: '5px 0 0 0' }}>{error}</p>
              </div>
            </div>
          )}
          
          {/* Sell Products Banner */}
          <div className="sell-banner">
            <div className="sell-banner-content">
              <div className="sell-banner-text">
                <h3>🌾 Are you a Farmer?</h3>
                <p>Sell your fresh produce directly to buyers and get the best prices!</p>
              </div>
              <Link to="/sell-products" className="sell-products-btn">
                <span>📦</span> Sell Your Products
              </Link>
            </div>
          </div>
          
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

            <div className="cart-favorites-container">
              <Link to="/cart" className={`cart-indicator ${cartItemCount > 0 ? 'has-items' : ''}`}>
                <span className="icon">🛒</span>
                <span>Cart</span>
                <span className="count">({cartItemCount})</span>
              </Link>
              
              <Link to="/favorites" className={`favorites-indicator ${favoritesCount > 0 ? 'has-items' : ''}`}>
                <span className="icon">❤️</span>
                <span>Favorites</span>
                <span className="count">({favoritesCount})</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="ecommerce-main">{
        /* Sidebar Categories */}
        <div className="sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                data-category={category.id}
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
                  {product.farmerProduct && (
                    <div className="farmer-badge">
                      🌾 Direct from Farmer
                    </div>
                  )}
                  {getDiscount(product.originalPrice, product.price) > 0 && (
                    <div className="discount-badge">
                      {getDiscount(product.originalPrice, product.price)}% OFF
                    </div>
                  )}
                  <div className="product-overlay">
                    <button 
                      className="quick-view-btn"
                      onClick={() => setQuickViewProduct(product)}
                    >
                      Quick View
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <div className="product-brand">{product.brand}</div>
                  {product.location && (
                    <div className="product-location">📍 {product.location}</div>
                  )}
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
                      {product.inStock ? (
                        isInCart(product.id) ? '✅ Added to Cart' : '🛒 Add to Cart'
                      ) : 'Out of Stock'}
                    </button>
                    <button 
                      className={`wishlist-btn ${isInFavorites(product.id) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(product)}
                      title={isInFavorites(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isInFavorites(product.id) ? '❤️' : '🤍'}
                    </button>
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
    </div>

    {/* Quick View Modal */}
    {quickViewProduct && (
      <QuickView 
        product={quickViewProduct} 
        onClose={() => setQuickViewProduct(null)} 
      />
    )}
  </>
  );
};

export default Ecommerce;