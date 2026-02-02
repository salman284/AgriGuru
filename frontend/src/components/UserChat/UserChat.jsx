import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import io from 'socket.io-client';
import './UserChat.css';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001';

const UserChat = () => {
  const { user: currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser || !isOpen) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Connected to chat server');
      socketRef.current.emit('user_online', {
        userId: currentUser.id,
        userName: currentUser.full_name || currentUser.email,
        userType: currentUser.userType
      });
    });

    socketRef.current.on('online_users', (users) => {
      console.log('👥 Online users:', users);
      setOnlineUsers(users.filter(u => u.userId !== currentUser.id));
    });

    socketRef.current.on('private_message', (data) => {
      console.log('📩 Received private message:', data);
      const chatId = data.senderId === currentUser.id ? data.recipientId : data.senderId;
      
      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), {
          id: Date.now(),
          text: data.message,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: data.timestamp,
          type: data.senderId === currentUser.id ? 'sent' : 'received'
        }]
      }));

      // Update unread count if not in active chat
      if (activeChat !== chatId && data.senderId !== currentUser.id) {
        setUnreadCounts(prev => ({
          ...prev,
          [chatId]: (prev[chatId] || 0) + 1
        }));
      }
    });

    socketRef.current.on('user_typing', (data) => {
      if (data.userId !== currentUser.id && data.recipientId === currentUser.id) {
        setTypingUsers(prev => ({ ...prev, [data.userId]: true }));
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [data.userId]: false }));
        }, 3000);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from chat server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('user_offline', { userId: currentUser.id });
        socketRef.current.disconnect();
      }
    };
  }, [currentUser, isOpen]);

  // Fetch all users
  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch(`${SOCKET_URL}/api/users`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setAllUsers(data.users.filter(u => u.id !== currentUser.id));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [currentUser, isOpen]);

  // Handle sending message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeChat || !socketRef.current) return;

    const message = {
      senderId: currentUser.id,
      senderName: currentUser.full_name || currentUser.email,
      recipientId: activeChat,
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    socketRef.current.emit('private_message', message);

    // Add to local messages immediately
    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), {
        id: Date.now(),
        text: inputMessage,
        senderId: currentUser.id,
        senderName: currentUser.full_name || currentUser.email,
        timestamp: new Date().toISOString(),
        type: 'sent'
      }]
    }));

    setInputMessage('');
    setIsTyping(false);
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!activeChat || !socketRef.current) return;

    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing', {
        userId: currentUser.id,
        userName: currentUser.full_name || currentUser.email,
        recipientId: activeChat
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Open chat with user
  const openChat = (userId) => {
    setActiveChat(userId);
    // Clear unread count
    setUnreadCounts(prev => ({ ...prev, [userId]: 0 }));
  };

  // Get user info
  const getUserInfo = (userId) => {
    return allUsers.find(u => u.id === userId) || onlineUsers.find(u => u.userId === userId);
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.some(u => u.userId === userId);
  };

  // Filter users based on search
  const filteredUsers = allUsers.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.userType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUser) return null;

  return (
    <>
      {/* Chat Toggle Button (collapsed state) */}
      {!isOpen && (
        <div className="user-chat-toggle" onClick={() => setIsOpen(true)}>
          <div className="chat-toggle-icon">💬</div>
          {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
            <div className="unread-badge">
              {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
            </div>
          )}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="user-chat-container">
          {/* Header */}
          <div className="user-chat-header">
            <div className="header-info">
              <div className="chat-avatar">💬</div>
              <div>
                <h3>Messages</h3>
                <span className="online-count">
                  {onlineUsers.length} online
                </span>
              </div>
            </div>
            <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="user-chat-body">
            {/* Sidebar - User List */}
            <div className="chat-sidebar">
              <div className="search-users">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="user-list">
                {filteredUsers.length === 0 ? (
                  <div className="no-users">No users found</div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={`user-item ${activeChat === user.id ? 'active' : ''}`}
                      onClick={() => openChat(user.id)}
                    >
                      <div className="user-avatar-container">
                        <div className="user-avatar">
                          {user.userType === 'farmer' ? '👨‍🌾' : '👤'}
                        </div>
                        {isUserOnline(user.id) && <div className="online-indicator" />}
                      </div>
                      <div className="user-info">
                        <div className="user-name">
                          {user.full_name || user.email}
                        </div>
                        <div className="user-type">
                          {user.userType || 'user'}
                        </div>
                      </div>
                      {unreadCounts[user.id] > 0 && (
                        <div className="unread-count">{unreadCounts[user.id]}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="chat-area-header">
                    <div className="chat-user-info">
                      <div className="chat-user-avatar">
                        {getUserInfo(activeChat)?.userType === 'farmer' ? '👨‍🌾' : '👤'}
                      </div>
                      <div>
                        <div className="chat-user-name">
                          {getUserInfo(activeChat)?.full_name || getUserInfo(activeChat)?.userName || 'User'}
                        </div>
                        <div className="chat-user-status">
                          {isUserOnline(activeChat) ? '🟢 Online' : '⚫ Offline'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="chat-messages">
                    {(!messages[activeChat] || messages[activeChat].length === 0) ? (
                      <div className="no-messages">
                        👋 Start a conversation!
                      </div>
                    ) : (
                      messages[activeChat].map((msg, idx) => (
                        <div key={idx} className={`chat-message ${msg.type}`}>
                          <div className="message-bubble">
                            <div className="message-text">{msg.text}</div>
                            <div className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {typingUsers[activeChat] && (
                      <div className="typing-indicator-container">
                        <div className="typing-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span className="typing-text">typing...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="chat-input-container">
                    <input
                      type="text"
                      className="message-input"
                      placeholder="Type a message..."
                      value={inputMessage}
                      onChange={(e) => {
                        setInputMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      className="send-message-btn"
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                    >
                      ➤
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-chat-selected">
                  <div className="no-chat-icon">💬</div>
                  <h3>Select a conversation</h3>
                  <p>Choose a user from the list to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserChat;
