import React, { useState, useEffect, useRef } from 'react';
import './AIChat.css';
import enhancedAIService from '../../services/enhancedAIService';
import VoiceInput from '../VoiceInput/VoiceInput';

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
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastVoiceInput, setLastVoiceInput] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    // Check AI backend status on component mount
    checkBackendStatus();
    
    // Add welcome message
    setMessages([{
      id: 1,
      text: `🌾 **Welcome to AgriGuru AI Chat!**

I'm your AI-powered farming assistant, powered by Groq LLaMA 3. I can help you with:

🌱 **Crop cultivation advice**
🧪 **Fertilizer recommendations**  
🐛 **Pest and disease management**
🌤️ **Weather-based planning**
📊 **Market insights**
📅 **Seasonal farming calendar**

🌐 **Multilingual Support**: I can understand and respond in:
- हिंदी (Hindi) 
- தமிழ் (Tamil)
- తెలుగు (Telugu)
- ਪੰਜਾਬੀ (Punjabi)
- বাংলা (Bengali)
- मराठी (Marathi)
- ગુજરાતી (Gujarati)
- ಕನ್ನಡ (Kannada)
- മലയാളം (Malayalam)
- English

Just ask me anything about farming in your preferred language, and I'll provide detailed, region-specific advice!

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

  // Handle voice input from VoiceInput component
  const handleVoiceInput = (voiceText, language, confidence) => {
    if (voiceText.trim()) {
      console.log('🎤 Voice input received:', { voiceText, language, confidence });
      
      // Set the input message
      setInputMessage(voiceText);
      
      // Store voice input info for message metadata
      setLastVoiceInput({
        language,
        confidence,
        timestamp: new Date().toISOString()
      });
      
      // Auto-send the message after a brief delay
      setTimeout(() => {
        handleSendMessage(null, voiceText, true);
      }, 500);
    }
  };

  const handleVoiceTranscription = (transcription) => {
    // Update input field in real-time as user speaks
    setInputMessage(prev => prev + transcription);
  };

  const handleSendMessage = async (e, messageOverride = null, isVoiceInput = false) => {
    if (e) e.preventDefault();
    
    const messageToSend = messageOverride || inputMessage;
    if (!messageToSend.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      isVoiceInput: isVoiceInput,
      voiceInfo: isVoiceInput ? lastVoiceInput : null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Clear voice input info after using it
    if (isVoiceInput) {
      setLastVoiceInput(null);
    }

    try {
      // Use the new chat endpoint
      const response = await enhancedAIService.chat(messageToSend, context);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.advice,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString(),
        model_type: response.model_type || 'unknown',
        success: response.success,
        language_info: response.language_info || { language: 'unknown', region: 'unknown' },
        regional_context: response.regional_context || 'India',
        multilingual_support: response.multilingual_support || false,
        provider: response.provider || 'groq'
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
                <p>Voice & Text Support • Multilingual</p>
              </div>
            </div>
            <div className="chat-header-controls">
              <button
                className={`voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? 'Disable voice input' : 'Enable voice input'}
              >
                {voiceEnabled ? '🎤' : '🔇'}
              </button>
              <button 
                className="close-btn" 
                onClick={toggleChat}
                title="Close Chat"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Voice Input Section */}
          {voiceEnabled && (
            <div className="voice-input-section">
              <VoiceInput
                onVoiceInput={handleVoiceInput}
                onTranscription={handleVoiceTranscription}
                disabled={isLoading}
              />
            </div>
          )}
          
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }} />
                  <div className="message-meta">
                    <div className="message-time">{message.timestamp}</div>
                    
                    {/* Voice input indicator for user messages */}
                    {message.sender === 'user' && message.isVoiceInput && (
                      <div className="voice-input-indicator">
                        <span className="voice-icon">🎤</span>
                        <span className="voice-text">Voice Input</span>
                        {message.voiceInfo?.language && (
                          <span className="voice-language">
                            ({message.voiceInfo.language})
                          </span>
                        )}
                        {message.voiceInfo?.confidence && (
                          <span className="voice-confidence">
                            {Math.round(message.voiceInfo.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Language info for bot messages */}
                    {message.sender === 'bot' && message.language_info && message.multilingual_support && (
                      <div className="language-info">
                        <span className="language-badge">
                          🌐 {message.language_info.language.charAt(0).toUpperCase() + message.language_info.language.slice(1)}
                        </span>
                        {message.regional_context !== 'India' && message.regional_context !== 'Pan-India' && (
                          <span className="region-badge">
                            📍 {message.regional_context}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
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
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={voiceEnabled ? "Type or use voice input above..." : "Ask me about farming, crops, weather..."}
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
                className="voice-input-toggle"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? 'Hide voice input' : 'Show voice input'}
              >
                {voiceEnabled ? '🎤' : '⌨️'}
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="send-btn"
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;