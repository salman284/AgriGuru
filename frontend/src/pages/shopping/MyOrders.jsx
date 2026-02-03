import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './MyOrders.css';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock orders - In a real app, fetch from backend
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockOrders = [
        {
          id: 'ORD001',
          date: '2026-01-28',
          status: 'delivered',
          total: 1250,
          items: [
            {
              id: 1,
              name: 'Organic Tomatoes',
              quantity: 5,
              unit: 'kg',
              price: 60,
              farmerName: 'Ramesh Kumar',
              image: '/images/products/tomatoes.jpeg'
            },
            {
              id: 2,
              name: 'Fresh Potatoes',
              quantity: 10,
              unit: 'kg',
              price: 30,
              farmerName: 'Sunita Devi',
              image: '/images/products/potatoes.jpeg'
            }
          ],
          deliveryAddress: '123 Main Street, Delhi, 110001',
          paymentMethod: 'UPI',
          trackingUpdates: [
            { date: '2026-01-28 10:00', status: 'Order Placed', description: 'Your order has been confirmed' },
            { date: '2026-01-28 14:30', status: 'Packed', description: 'Farmer has packed your items' },
            { date: '2026-01-29 09:00', status: 'Shipped', description: 'Order is on the way' },
            { date: '2026-01-29 18:00', status: 'Delivered', description: 'Order delivered successfully' }
          ]
        },
        {
          id: 'ORD002',
          date: '2026-01-30',
          status: 'shipped',
          total: 890,
          items: [
            {
              id: 3,
              name: 'Fresh Spinach',
              quantity: 2,
              unit: 'kg',
              price: 40,
              farmerName: 'Amit Singh',
              image: '/images/products/spinach.jpeg'
            },
            {
              id: 4,
              name: 'Organic Cauliflower',
              quantity: 3,
              unit: 'kg',
              price: 50,
              farmerName: 'Priya Sharma',
              image: '/images/products/cauliflower.jpeg'
            }
          ],
          deliveryAddress: '456 Garden Road, Mumbai, 400001',
          paymentMethod: 'Card',
          trackingUpdates: [
            { date: '2026-01-30 11:00', status: 'Order Placed', description: 'Your order has been confirmed' },
            { date: '2026-01-30 16:00', status: 'Packed', description: 'Farmer has packed your items' },
            { date: '2026-01-31 08:00', status: 'Shipped', description: 'Order is on the way' }
          ]
        },
        {
          id: 'ORD003',
          date: '2026-01-31',
          status: 'pending',
          total: 1560,
          items: [
            {
              id: 5,
              name: 'Basmati Rice',
              quantity: 10,
              unit: 'kg',
              price: 80,
              farmerName: 'Rajesh Patel',
              image: '/images/products/Basmati Rice.jpg'
            },
            {
              id: 6,
              name: 'Fresh Milk',
              quantity: 5,
              unit: 'liters',
              price: 60,
              farmerName: 'Meena Devi',
              image: '/images/products/tomatoes.jpeg'
            }
          ],
          deliveryAddress: '789 Village Road, Pune, 411001',
          paymentMethod: 'Cash on Delivery',
          trackingUpdates: [
            { date: '2026-01-31 10:30', status: 'Order Placed', description: 'Your order has been confirmed' }
          ]
        }
      ];
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: '⏳', text: 'Pending', class: 'pending' },
      confirmed: { icon: '✓', text: 'Confirmed', class: 'confirmed' },
      packed: { icon: '📦', text: 'Packed', class: 'packed' },
      shipped: { icon: '🚚', text: 'Shipped', class: 'shipped' },
      delivered: { icon: '✅', text: 'Delivered', class: 'delivered' },
      cancelled: { icon: '❌', text: 'Cancelled', class: 'cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  if (loading) {
    return (
      <div className="my-orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="my-orders">
      {/* Header */}
      <div className="orders-header">
        <div className="header-content">
          <h1>📦 My Orders</h1>
          <p>Track and manage your orders</p>
        </div>
        <Link to="/marketplace" className="shop-more-btn">
          🛒 Shop More
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="orders-filters">
        <button
          className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Orders ({orders.length})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          ⏳ Pending ({orders.filter(o => o.status === 'pending').length})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'shipped' ? 'active' : ''}`}
          onClick={() => setFilterStatus('shipped')}
        >
          🚚 Shipped ({orders.filter(o => o.status === 'shipped').length})
        </button>
        <button
          className={`filter-tab ${filterStatus === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilterStatus('delivered')}
        >
          ✅ Delivered ({orders.filter(o => o.status === 'delivered').length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>No orders found</h3>
          <p>Start shopping to see your orders here</p>
          <Link to="/marketplace" className="start-shopping-btn">
            🛒 Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => {
            const badge = getStatusBadge(order.status);
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <span className="order-date">
                      📅 {new Date(order.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <span className={`order-status ${badge.class}`}>
                    {badge.icon} {badge.text}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map(item => (
                    <div key={item.id} className="order-item">
                      <img src={item.image} alt={item.name} />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="farmer-name">👨‍🌾 {item.farmerName}</p>
                        <p className="item-quantity">
                          {item.quantity} {item.unit} × ₹{item.price}
                        </p>
                      </div>
                      <div className="item-price">
                        ₹{item.quantity * item.price}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span>Total Amount:</span>
                    <strong>₹{order.total}</strong>
                  </div>
                  <div className="order-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </button>
                    {order.status === 'delivered' && (
                      <button className="reorder-btn">
                        🔄 Reorder
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button className="cancel-btn">
                        ❌ Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowDetails(false)}>×</button>
            
            <div className="modal-header">
              <h2>Order Details #{selectedOrder.id}</h2>
              {(() => {
                const badge = getStatusBadge(selectedOrder.status);
                return (
                  <span className={`order-status ${badge.class}`}>
                    {badge.icon} {badge.text}
                  </span>
                );
              })()}
            </div>

            <div className="modal-body">
              {/* Order Items */}
              <div className="details-section">
                <h3>📦 Items</h3>
                <div className="details-items">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="details-item">
                      <img src={item.image} alt={item.name} />
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p className="farmer-name">👨‍🌾 {item.farmerName}</p>
                        <p className="item-quantity">
                          {item.quantity} {item.unit} × ₹{item.price}
                        </p>
                      </div>
                      <div className="item-total">
                        ₹{item.quantity * item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="details-section">
                <h3>🚚 Delivery Information</h3>
                <div className="info-box">
                  <p><strong>Address:</strong> {selectedOrder.deliveryAddress}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>Order Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Order Tracking */}
              <div className="details-section">
                <h3>📍 Order Tracking</h3>
                <div className="tracking-timeline">
                  {selectedOrder.trackingUpdates.map((update, index) => (
                    <div 
                      key={index} 
                      className={`tracking-step ${index === selectedOrder.trackingUpdates.length - 1 ? 'current' : 'completed'}`}
                    >
                      <div className="step-indicator"></div>
                      <div className="step-content">
                        <h4>{update.status}</h4>
                        <p className="step-time">{update.date}</p>
                        <p className="step-description">{update.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="details-section">
                <h3>💰 Price Breakdown</h3>
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.total}</span>
                  </div>
                  <div className="price-row">
                    <span>Delivery:</span>
                    <span className="free">FREE</span>
                  </div>
                  <div className="price-row total">
                    <span>Total:</span>
                    <strong>₹{selectedOrder.total}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedOrder.status === 'delivered' && (
                <button className="rate-btn">⭐ Rate Order</button>
              )}
              <button className="download-btn">📄 Download Invoice</button>
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <button className="track-btn">🗺️ Track Order</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
