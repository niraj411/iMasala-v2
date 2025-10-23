import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

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
      const token = localStorage.getItem('wc_token');
      if (token) {
        const userData = await authService.validateToken();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
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
    localStorage.setItem('wc_token', response.token);
    return { success: true, user: userWithRoles };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('wc_token');
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