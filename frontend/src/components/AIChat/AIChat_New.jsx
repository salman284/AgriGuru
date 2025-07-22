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
        text: `❌ **Error:** ${error.message}\\n\\nPlease check if the AI backend is running.`,
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
      .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\\n/g, '<br>');
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

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className={`chat-toggle ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
        {isOpen ? '✕' : '💬'}
        {!isOpen && (
          <div className="chat-notification">
            <span className="status-dot">{getModelStatusIcon()}</span>
            AI Chat
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="chat-title">
            <h4>🤖 AgriGuru AI</h4>
            <div className="model-status">
              <span className="status-icon">{getModelStatusIcon()}</span>
              <span className="status-text">{getModelStatusText()}</span>
            </div>
          </div>
          
          <div className="chat-controls">
            <button 
              onClick={checkBackendStatus}
              className="btn-refresh"
              title="Check connection"
            >
              🔄
            </button>
            <button 
              onClick={clearChat}
              className="btn-clear"
              title="Clear chat"
            >
              🗑️
            </button>
            <button onClick={toggleChat} className="btn-close">✕</button>
          </div>
        </div>

        <div className="context-panel">
          <div className="context-inputs">
            <select 
              value={context.crop} 
              onChange={(e) => handleContextChange('crop', e.target.value)}
              className="context-select"
            >
              <option value="">Crop</option>
              <option value="rice">Rice</option>
              <option value="wheat">Wheat</option>
              <option value="cotton">Cotton</option>
              <option value="maize">Maize</option>
              <option value="sugarcane">Sugarcane</option>
            </select>
            
            <select 
              value={context.season} 
              onChange={(e) => handleContextChange('season', e.target.value)}
              className="context-select"
            >
              <option value="">Season</option>
              <option value="kharif">Kharif</option>
              <option value="rabi">Rabi</option>
              <option value="summer">Summer</option>
            </select>
            
            <input
              type="text"
              placeholder="Location"
              value={context.location}
              onChange={(e) => handleContextChange('location', e.target.value)}
              className="context-input"
            />
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                <div 
                  className="message-text"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                />
                <div className="message-meta">
                  <span className="timestamp">{message.timestamp}</span>
                  {message.model_type && message.sender === 'bot' && (
                    <span className="model-type">
                      {message.model_type === 'vertex_ai' ? '☁️' : 
                       message.model_type === 'local' ? '💻' : 
                       message.model_type === 'fallback' ? '📱' : 
                       '🤖'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="message-meta">
                  <span className="timestamp">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="chat-input-wrapper">
            <textarea
              ref={chatInputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about farming... (Enter to send, Shift+Enter for new line)"
              className="chat-input"
              rows="2"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
          
          {!isConnected && (
            <div className="connection-warning">
              ⚠️ AI backend offline. Limited responses available.
              <button type="button" onClick={checkBackendStatus} className="retry-btn">
                Retry
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};

export default AIChat;
