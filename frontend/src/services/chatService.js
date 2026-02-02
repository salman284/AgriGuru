import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001';
const API_URL = SOCKET_URL;

class ChatService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  // Initialize socket connection
  connect(userId, userName, userType) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Chat service connected');
      this.socket.emit('user_online', {
        userId,
        userName,
        userType
      });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Chat service disconnected');
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.socket.emit('user_online', {
        userId,
        userName,
        userType
      });
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect(userId) {
    if (this.socket) {
      this.socket.emit('user_offline', { userId });
      this.socket.disconnect();
      this.socket = null;
      this.listeners = {};
    }
  }

  // Send private message
  sendMessage(message) {
    if (this.socket?.connected) {
      this.socket.emit('private_message', message);
      return true;
    }
    return false;
  }

  // Emit typing indicator
  sendTyping(userId, userName, recipientId) {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        userId,
        userName,
        recipientId
      });
    }
  }

  // Listen for private messages
  onPrivateMessage(callback) {
    if (this.socket) {
      this.socket.on('private_message', callback);
      this.listeners['private_message'] = callback;
    }
  }

  // Listen for online users
  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.on('online_users', callback);
      this.listeners['online_users'] = callback;
    }
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      this.listeners['user_typing'] = callback;
    }
  }

  // Listen for new user connections
  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user_joined', callback);
      this.listeners['user_joined'] = callback;
    }
  }

  // Listen for user disconnections
  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user_left', callback);
      this.listeners['user_left'] = callback;
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      Object.keys(this.listeners).forEach(event => {
        this.socket.off(event);
      });
      this.listeners = {};
    }
  }

  // Fetch all users
  async getUsers() {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }
  }

  // Fetch chat history with a specific user
  async getChatHistory(userId, otherUserId, limit = 50) {
    try {
      const response = await fetch(
        `${API_URL}/api/chat/history?userId=${userId}&otherUserId=${otherUserId}&limit=${limit}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark messages as read
  async markAsRead(userId, otherUserId) {
    try {
      const response = await fetch(`${API_URL}/api/chat/mark-read`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          otherUserId
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Get unread message counts
  async getUnreadCounts(userId) {
    try {
      const response = await fetch(`${API_URL}/api/chat/unread-counts?userId=${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      return { success: false, error: error.message };
    }
  }

  // Search users
  async searchUsers(query) {
    try {
      const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, error: error.message };
    }
  }

  // Block/unblock user
  async blockUser(userId, blockUserId, block = true) {
    try {
      const response = await fetch(`${API_URL}/api/chat/block`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          blockUserId,
          block
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      return { success: false, error: error.message };
    }
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

const chatService = new ChatService();
export default chatService;
