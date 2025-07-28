import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './chat.css';

const BACKEND_URL = 'http://localhost:5001/api/chat'; // Adjust as needed

const ChatBox = ({ currentUser }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  // Image upload state
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [typingStatus, setTypingStatus] = useState(null);
  const pollingRef = useRef(null);

  // No user selection needed for group chat

  useEffect(() => {
    // Poll for group messages and typing status when chat is open
    if (currentUser && open) {
      pollingRef.current = setInterval(() => {
        axios.get(`${BACKEND_URL}/messages`)
          .then(res => {
            setMessages(res.data.messages || []);
            setTypingStatus(res.data.typing || null); // expects backend to send { typing: 'UserName' } or null
          })
          .catch(() => {});
      }, 2000);
    }
    return () => clearInterval(pollingRef.current);
  }, [currentUser, open]);

  // Simulate login (replace with real auth)
  if (!currentUser) {
    return <div className="chat-login-msg">Please login to access farmer chat.</div>;
  }

  const handleOpenChat = () => {
    setOpen(true);
  };

  const handleCloseChat = () => {
    setOpen(false);
    setMessages([]);
  };

  // Send message or image to group
  const handleSend = async () => {
    if (input.trim() === '' && !imagePreview) return;
    const newMsg = {
      text: input,
      sender: currentUser.name,
      from: currentUser.id,
      image: imagePreview || null
    };
    setMessages([...messages, newMsg]);
    setInput('');
    setImage(null);
    setImagePreview(null);
    try {
      await axios.post(`${BACKEND_URL}/send`, newMsg);
    } catch (err) {
      // Optionally show error
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    // Typing indicator POST removed to prevent network error
    // axios.post(`${BACKEND_URL}/typing`, { user: currentUser.name, typing: !!e.target.value });
  };

  return (
    <>
      {/* Floating Chat Icon (bottom right) */}
      {!open && (
        <div className="chat-icon" onClick={handleOpenChat} title="Farmer Chat">
          <span role="img" aria-label="chat">💬</span>
        </div>
      )}
      {/* Modern Group Chat Bar */}
      {open && (
        <div className="chat-bar modern-chat">
          <div className="chat-header modern-chat-header">
            <div className="chat-avatar">
              <span role="img" aria-label="avatar">👨‍🌾</span>
            </div>
            <div className="chat-title">
              <span>AgriGuru Group Chat</span>
              <span className="chat-status online">Collaborative Platform</span>
            </div>
            <button className="close-btn" onClick={handleCloseChat}>×</button>
          </div>
          {/* Group Chat Window */}
          <div className="chat-messages modern-chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`chat-message modern-message-bubble ${msg.sender === currentUser.name ? 'user' : 'other'}`}>
                  <div className="bubble-content">
                    <span className="bubble-sender">{msg.sender === currentUser.name ? 'You' : msg.sender}</span>
                    {msg.text && <span className="bubble-text">{msg.text}</span>}
                    {msg.image && (
                      <img src={msg.image} alt="Sent" className="bubble-image" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="chat-input-area modern-input-area">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="modern-input"
              autoFocus
            />
            <label className="attach-image-btn" title="Attach Image">
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              <span role="img" aria-label="attach">📷</span>
            </label>
            <button onClick={handleSend} className="send-btn modern-send-btn">
              <span role="img" aria-label="send">📤</span>
            </button>
          </div>
          {imagePreview && (
            <div className="image-preview-area">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button className="remove-image-btn" onClick={handleRemoveImage} title="Remove Image">✖</button>
            </div>
          )}
          {typingStatus && typingStatus !== currentUser.name && (
            <div className="typing-indicator">{typingStatus} is typing...</div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox;
