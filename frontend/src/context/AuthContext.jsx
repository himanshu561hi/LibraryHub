import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../services/api/client.js';
import { API_ENDPOINTS } from '../services/api/endpoints.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session from stored token or cookie on mount
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('lh_auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await client.get(API_ENDPOINTS.AUTH.ME);
        if (res && res.success && res.data) {
          setUser(res.data);
        } else {
          localStorage.removeItem('lh_auth_token');
          setUser(null);
        }
      } catch (err) {
        console.warn('Session check failed:', err.message);
        localStorage.removeItem('lh_auth_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  /**
   * Google OAuth Sign-in for students
   */
  const loginWithGoogle = async (idToken, profileData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.post(API_ENDPOINTS.AUTH.GOOGLE, {
        idToken,
        ...profileData,
      });

      if (res && res.success && res.data) {
        const { token, user: loggedUser } = res.data;
        if (token) {
          localStorage.setItem('lh_auth_token', token);
        }
        setUser(loggedUser);
        return { success: true, user: loggedUser };
      }
      throw new Error(res?.error?.message || 'Google sign-in failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Admin Email/Password Sign-in
   */
  const loginAsAdmin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, { email, password });
      if (res && res.success && res.data) {
        const { token, admin } = res.data;
        if (token) {
          localStorage.setItem('lh_auth_token', token);
        }
        setUser(admin);
        return { success: true, user: admin };
      }
      throw new Error(res?.error?.message || 'Admin login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fast Development/Evaluation Sign-in
   * Enables seamless 1-click test login in development mode.
   */
  const fastDevLogin = async (role = 'student') => {
    setLoading(true);
    setError(null);
    try {
      if (role === 'admin') {
        return await loginAsAdmin('admin@libraryhub.in', 'LibraryHub@2025');
      } else {
        const mockToken = `mock-token-${Date.now()}@libraryhub.in`;
        return await loginWithGoogle(mockToken, {
          name: 'Demo Student',
          phone: '9876543210',
          targetExam: 'UPSC CSE',
        });
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update student profile fields
   */
  const updateProfile = async (profileData) => {
    try {
      const res = await client.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
      if (res && res.success && res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
        return { success: true, user: res.data };
      }
      throw new Error(res?.error?.message || 'Profile update failed');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Logout and clear local/cookie credentials, then redirect to Home page
   */
  const logout = async () => {
    try {
      await client.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      // Ignore network failures on logout
    } finally {
      localStorage.removeItem('lh_auth_token');
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
        isStudent: user?.role === 'student',
        isAuthenticated: Boolean(user),
        loading,
        error,
        loginWithGoogle,
        loginAsAdmin,
        fastDevLogin,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

