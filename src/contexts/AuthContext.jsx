import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storageService.get('wc_token');
      console.log('Auth check - token exists:', !!token);
      if (token) {
        const userData = await authService.validateToken();
        console.log('Auth check - user validated:', userData?.email);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('Auth check - no token found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

const login = async (username, password) => {
  try {
    const response = await authService.login(username, password);

    // WordPress returns roles as an array directly on the user object
    const userWithRoles = {
      ...response.user,
      roles: response.user.roles || [] // Ensure roles is always an array
    };

    setUser(userWithRoles);
    setIsAuthenticated(true);
    await storageService.set('wc_token', response.token);
    return { success: true, user: userWithRoles };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    await storageService.remove('wc_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);