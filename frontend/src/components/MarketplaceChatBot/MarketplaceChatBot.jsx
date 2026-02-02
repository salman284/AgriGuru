import React, { useState, useRef, useEffect } from 'react';
import './MarketplaceChatBot.css';

const MarketplaceChatBot = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '👋 Hello! I\'m your Shopping Assistant. I can help you with:\n\n🥬 Product availability\n💰 Prices\n🚚 Delivery information\n📍 Farmer locations\n\nWhat would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findProducts = (query) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p => 
      (p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)) &&
      p.inStock
    );
  };

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Greetings
    if (lowerMessage.match(/^(hi|hello|hey|namaste)/i)) {
      return '👋 Hello! How can I help you find fresh products today? You can ask me about availability, prices, or delivery options.';
    }

    // Availability queries
    if (lowerMessage.includes('available') || lowerMessage.includes('stock') || lowerMessage.includes('have')) {
      const matchedProducts = findProducts(userMessage);
      
      if (matchedProducts.length > 0) {
        let response = `✅ Yes! We have ${matchedProducts.length} product${matchedProducts.length > 1 ? 's' : ''} available:\n\n`;
        matchedProducts.slice(0, 5).forEach(p => {
          response += `🥬 ${p.name}\n   💰 ₹${p.price}/${p.unit}\n   📦 ${p.quantity} ${p.unit} in stock\n   👨‍🌾 ${p.farmerName} (${p.location})\n\n`;
        });
        
        if (matchedProducts.length > 5) {
          response += `...and ${matchedProducts.length - 5} more items!`;
        }
        
        return response;
      } else {
        const veggies = products.filter(p => p.category === 'vegetables' && p.inStock);
        return `😔 That specific item isn't available right now, but we have ${veggies.length} fresh vegetables in stock! Try asking about "vegetables" or "tomatoes".`;
      }
    }

    // Price queries
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('₹') || lowerMessage.includes('cheap')) {
      const matchedProducts = findProducts(userMessage);
      
      if (matchedProducts.length > 0) {
        let response = '💰 Current prices:\n\n';
        matchedProducts.slice(0, 5).forEach(p => {
          const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
          response += `${p.name}: ₹${p.price}/${p.unit}`;
          if (discount > 0) {
            response += ` (Save ${discount}%)`;
          }
          response += `\n`;
        });
        return response;
      } else {
        const sorted = [...products].filter(p => p.inStock).sort((a, b) => a.price - b.price);
        return `💰 Prices range from ₹${sorted[0]?.price}/${sorted[0]?.unit} to ₹${sorted[sorted.length-1]?.price}/${sorted[sorted.length-1]?.unit}.\n\nWhich product would you like to know about?`;
      }
    }

    // Delivery queries
    if (lowerMessage.includes('deliver') || lowerMessage.includes('shipping') || lowerMessage.includes('ship')) {
      const matchedProducts = findProducts(userMessage);
      
      if (matchedProducts.length > 0) {
        const withDelivery = matchedProducts.filter(p => p.deliveryAvailable);
        const withoutDelivery = matchedProducts.filter(p => !p.deliveryAvailable);
        
        let response = '';
        if (withDelivery.length > 0) {
          response += `🚚 Delivery available:\n`;
          withDelivery.slice(0, 5).forEach(p => {
            response += `✅ ${p.name} - ${p.location}\n`;
          });
        }
        if (withoutDelivery.length > 0) {
          response += `\n📍 Pickup only:\n`;
          withoutDelivery.slice(0, 3).forEach(p => {
            response += `⚠️ ${p.name} - ${p.location}\n`;
          });
        }
        response += `\n⏱️ Delivery typically takes 1-3 days.`;
        return response;
      } else {
        const deliveryCount = products.filter(p => p.deliveryAvailable && p.inStock).length;
        return `🚚 We offer delivery for ${deliveryCount} products!\n\n📦 Delivery info:\n⏱️ Usually 1-3 days\n💵 Charges vary by location\n📞 Contact farmer for details\n\nWhich product are you interested in?`;
      }
    }

    // Location/farmer queries
    if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('farmer')) {
      const matchedProducts = findProducts(userMessage);
      
      if (matchedProducts.length > 0) {
        let response = '📍 Product locations:\n\n';
        matchedProducts.slice(0, 5).forEach(p => {
          response += `${p.name}\n👨‍🌾 ${p.farmerName}\n📍 ${p.location}\n📞 ${p.phoneNumber}\n\n`;
        });
        return response;
      } else {
        const locations = [...new Set(products.map(p => p.location))];
        return `📍 Our farmers are from: ${locations.join(', ')}.\n\nWhich product or location interests you?`;
      }
    }

    // Organic queries
    if (lowerMessage.includes('organic') || lowerMessage.includes('certified')) {
      const organicProducts = products.filter(p => p.organicCertified && p.inStock);
      let response = `🌱 ${organicProducts.length} certified organic products:\n\n`;
      organicProducts.slice(0, 5).forEach(p => {
        response += `✅ ${p.name} - ₹${p.price}/${p.unit}\n`;
      });
      return response;
    }

    // Fresh/harvest queries
    if (lowerMessage.includes('fresh') || lowerMessage.includes('harvest')) {
      const recentProducts = products
        .filter(p => p.inStock && p.harvestDate)
        .sort((a, b) => new Date(b.harvestDate) - new Date(a.harvestDate))
        .slice(0, 5);
      
      let response = '🌾 Freshly harvested:\n\n';
      recentProducts.forEach(p => {
        const daysAgo = Math.floor((new Date() - new Date(p.harvestDate)) / (1000 * 60 * 60 * 24));
        response += `${p.name} - ${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago\n`;
      });
      return response;
    }

    // Default response
    return `I can help you with:\n\n🔍 "Do you have tomatoes?"\n💰 "How much is spinach?"\n🚚 "Delivery for onions?"\n📍 "Where are farmers from?"\n🌱 "Show organic items"\n\nWhat would you like to know?`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      const botMessage = {
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    '🥬 Available vegetables?',
    '💰 Show prices',
    '🚚 Delivery options?',
    '🌱 Organic products?'
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
  <>
    {/* Collapsed Header (when chat is closed) */}
    {!isOpen && (
      <div
        className="chat-header chat-header-collapsed"
        onClick={() => setIsOpen(true)}
      >
        <div className="chat-header-info">
          <div className="bot-avatar">🛒</div>
          <div>
            <h3>Shopping Assistant</h3>
            <span className="status">● Online</span>
          </div>
        </div>
      </div>
    )}

    {/* Chat Window */}
    {isOpen && (
      <div className="marketplace-chatbot">
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="bot-avatar">🛒</div>
            <div>
              <h3>Shopping Assistant</h3>
              <span className="status">● Online</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              {message.type === 'bot' && <div className="msg-avatar">🛒</div>}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {message.type === 'user' && <div className="msg-avatar">👤</div>}
            </div>
          ))}

          {isTyping && (
            <div className="message bot">
              <div className="msg-avatar">🛒</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 2 && (
          <div className="quick-questions">
            <p>Quick questions:</p>
            <div className="quick-btns">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  className="quick-btn"
                  onClick={() => handleQuickQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask about products, prices, delivery..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="send-btn"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    )}
  </>
);
};

export default MarketplaceChatBot;