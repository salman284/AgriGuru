import React, { useState, useEffect, useRef } from 'react';
import './AIChat.css';
import enhancedAIService from '../../services/enhancedAIService';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [context, setContext] = useState({
    crop: '',
    season: '',
    location: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    // Check AI backend status on component mount
    checkBackendStatus();
    
    // Add welcome message
    setMessages([{
      id: 1,
      text: `🌾 **Welcome to AgriGuru AI Chat!**

I'm your AI-powered farming assistant, powered by Gemma 2. I can help you with:

🌱 **Crop cultivation advice**
🧪 **Fertilizer recommendations**  
🐛 **Pest and disease management**
🌤️ **Weather-based planning**
📊 **Market insights**
📅 **Seasonal farming calendar**

Just ask me anything about farming, and I'll provide detailed, personalized advice!

*Type your question below to get started...*`,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString(),
      model_type: 'welcome'
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkBackendStatus = async () => {
    try {
      const serverStatus = await enhancedAIService.checkServerStatus();
      setIsConnected(serverStatus);
      
      if (serverStatus) {
        const modelResponse = await enhancedAIService.getModelInfo();
        if (modelResponse.success) {
          setModelInfo(modelResponse.model_info);
        }
      }
    } catch (error) {
      console.error('Backend status check failed:', error);
      setIsConnected(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Use the new chat endpoint
      const response = await enhancedAIService.chat(inputMessage, context);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.advice,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        model_type: response.model_type || 'unknown',
        success: response.success
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update connection status
      setIsConnected(response.success);
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `❌ **Error:** ${error.message}\n\nPlease check if the AI backend is running.`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        model_type: 'error',
        success: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleContextChange = (field, value) => {
    setContext(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearChat = async () => {
    try {
      await enhancedAIService.clearConversationHistory();
      setMessages([{
        id: Date.now(),
        text: '🔄 **Chat cleared!** How can I help you with farming today?',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        model_type: 'system'
      }]);
    } catch (error) {
      console.error('Failed to clear chat:', error);
    }
  };

  const formatMessage = (content) => {
    // Convert markdown-style formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  const getModelStatusIcon = () => {
    if (!isConnected) return '🔴';
    if (modelInfo?.model_type === 'vertex_ai') return '☁️';
    if (modelInfo?.model_type === 'local') return '💻';
    return '🤖';
  };

  const getModelStatusText = () => {
    if (!isConnected) return 'Offline';
    if (modelInfo?.model_type === 'vertex_ai') return 'Vertex AI';
    if (modelInfo?.model_type === 'local') return 'Local AI';
    return 'Connected';
  };
        id: Date.now() + 1,
        text: response.data.advice,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting to the server. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="ai-chat-container">
      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle-btn" 
        onClick={toggleChat}
        title={isOpen ? "Close Chat" : "Open AgriGuru AI Assistant"}
      >
        {isOpen ? "✕" : "🤖"}
        {!isOpen && (
          <div className="chat-notification">
            <span>💬</span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="ai-avatar">🤖</div>
              <div>
                <h4>AgriGuru AI Assistant</h4>
                <p>Ask me anything about farming!</p>
              </div>
            </div>
            <button 
              className="close-btn" 
              onClick={toggleChat}
              title="Close Chat"
            >
              ✕
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                  <div className="message-time">{message.timestamp}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message ai-message">
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

          {/* Quick Action Buttons */}
          <div className="quick-actions">
            <button 
              className="quick-action-btn" 
              onClick={() => setInputMessage("What crops should I plant this season?")}
            >
              🌱 Crop Selection
            </button>
            <button 
              className="quick-action-btn" 
              onClick={() => setInputMessage("How do I improve soil health?")}
            >
              🌱 Soil Health
            </button>
            <button 
              className="quick-action-btn" 
              onClick={() => setInputMessage("Pest control advice")}
            >
              🐛 Pest Control
            </button>
            <button 
              className="quick-action-btn" 
              onClick={() => setInputMessage("Irrigation tips")}
            >
              💧 Irrigation
            </button>
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about farming, crops, weather..."
              className="message-input"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;