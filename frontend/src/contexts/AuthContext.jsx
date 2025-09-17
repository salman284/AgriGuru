import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/check-auth', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (data.authenticated) {
        // Get full user profile
        const profileResponse = await fetch('http://localhost:5001/api/profile', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.user && Object.keys(profileData.user).length > 0) {
            setUser(profileData.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.user && Object.keys(data.user).length > 0) {
        setUser(data.user);
        return { success: true, message: data.message };
      } else {
        setUser(null);
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Connection error. Please try again.' };
    }
  };

  const signup = async (email, password, full_name, phone) => {
    try {
      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, full_name, phone })
      });

      const data = await response.json();

      if (data.success) {
        // Auto-login after successful signup
        const loginResult = await login(email, password);
        return loginResult;
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Connection error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5001/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setUser(null);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('http://localhost:5001/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.success) {
        // Refresh user data
        await checkAuthStatus();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Update failed. Please try again.' };
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    checkAuthStatus,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
