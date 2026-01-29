import React, { createContext, useContext, useState, useEffect } from 'react';
import googleAuthService from '../services/googleAuthService';

const AuthContext = createContext();

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

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
      console.log('🔍 Checking auth status...');
      const response = await fetch(`${API_URL}/api/check-auth`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      console.log('📥 Check-auth response:', data);
      
      if (data.authenticated) {
        // Get full user profile
        const profileResponse = await fetch(`${API_URL}/api/profile`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('📥 Profile data:', profileData);
          
          if (profileData.user && Object.keys(profileData.user).length > 0) {
            // Ensure userType exists (fallback to customer or localStorage)
            const storedUserType = localStorage.getItem('userType');
            console.log('💾 Stored userType from localStorage:', storedUserType);
            
            const userWithType = {
              ...profileData.user,
              userType: profileData.user.userType || storedUserType || 'customer'
            };
            console.log('👤 Setting user with userType:', userWithType.userType);
            setUser(userWithType);
            
            // Store userType in localStorage
            if (userWithType.userType) {
              localStorage.setItem('userType', userWithType.userType);
            }
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
      console.error('❌ Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, userType = 'customer') => {
    try {
      console.log('🔐 Login attempt with userType:', userType);
      
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, userType })
      });

      const data = await response.json();
      console.log('📥 Login response:', data);
      console.log('📥 Response status:', response.status);
      console.log('📥 data.success:', data.success);
      console.log('📥 data.message:', data.message);

      if (data.success && data.user && Object.keys(data.user).length > 0) {
        // Backend should return userType, but fallback to what was sent
        const userWithType = { 
          ...data.user, 
          userType: data.user.userType || userType 
        };
        console.log('👤 Setting user with userType:', userWithType.userType);
        setUser(userWithType);
        
        // Store userType in localStorage
        localStorage.setItem('userType', userWithType.userType);
        console.log('💾 Stored userType in localStorage:', userWithType.userType);
        
        return { success: true, message: data.message };
      } else {
        setUser(null);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: 'Connection error. Please try again.' };
    }
  };

  const signup = async (email, password, full_name, phone, userType = 'customer') => {
    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, full_name, phone, userType })
      });

      const data = await response.json();

      if (data.success) {
        // Auto-login after successful signup
        const loginResult = await login(email, password, userType);
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
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Clear localStorage
      localStorage.removeItem('userType');
      
      setUser(null);
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Logout failed' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
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

  const loginWithGoogle = async () => {
    try {
      const result = await googleAuthService.signIn();
      
      if (result.success && result.authCode) {
        // Send authorization code to backend
        const response = await fetch(`${API_URL}/api/google-login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authCode: result.authCode
          })
        });

        const data = await response.json();

        if (data.success && data.user) {
          setUser(data.user);
          return { success: true, message: 'Google login successful' };
        } else {
          return { success: false, message: data.message || 'Google login failed' };
        }
      } else {
        return { success: false, message: result.error || 'Google authentication failed' };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, message: 'Google login failed. Please try again.' };
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
    loginWithGoogle,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
