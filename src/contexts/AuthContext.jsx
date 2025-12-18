import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser
} from '../config/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Only handle Firebase auth if we don't have a WordPress user
      const wcToken = await storageService.get('wc_token');
      if (!wcToken && firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          first_name: firebaseUser.displayName?.split(' ')[0] || '',
          last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          roles: ['customer'], // App users are customers by default
          authProvider: 'firebase'
        };
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      // First check for WordPress token
      const token = await storageService.get('wc_token');
      console.log('Auth check - WP token exists:', !!token);

      if (token) {
        const userData = await authService.validateToken();
        console.log('Auth check - WP user validated:', userData?.email);
        setUser({ ...userData, authProvider: 'wordpress' });
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // If no WP token, Firebase auth state listener will handle it
      // Just check if Firebase has a current user
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        console.log('Auth check - Firebase user found:', firebaseUser.email);
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          first_name: firebaseUser.displayName?.split(' ')[0] || '',
          last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          roles: ['customer'],
          authProvider: 'firebase'
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log('Auth check - no user found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  // Register new users with Firebase Auth
  const register = async ({ email, password, firstName, lastName, phone }) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Build user data immediately (don't wait for profile update)
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        first_name: firstName,
        last_name: lastName || '',
        phone: phone || '',
        roles: ['customer'],
        authProvider: 'firebase'
      };

      // Set user state immediately so UI can proceed
      setUser(userData);
      setIsAuthenticated(true);

      // Update profile and store phone in background (non-blocking)
      const displayName = `${firstName} ${lastName}`.trim();
      updateProfile(firebaseUser, { displayName }).catch(err =>
        console.warn('Profile update failed:', err)
      );

      if (phone) {
        storageService.set(`user_phone_${firebaseUser.uid}`, phone).catch(err =>
          console.warn('Phone storage failed:', err)
        );
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error('Firebase registration error:', error);
      let errorMessage = 'Failed to create account';

      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }

      return { success: false, error: errorMessage };
    }
  };

  // Login - try WordPress first, then Firebase
  const login = async (username, password) => {
    // First, try WordPress/WooCommerce login
    try {
      const response = await authService.login(username, password);

      const userWithRoles = {
        ...response.user,
        roles: response.user.roles || [],
        authProvider: 'wordpress'
      };

      setUser(userWithRoles);
      setIsAuthenticated(true);
      await storageService.set('wc_token', response.token);
      return { success: true, user: userWithRoles };
    } catch (wpError) {
      console.log('WordPress login failed, trying Firebase...', wpError.message);
    }

    // If WordPress login fails, try Firebase
    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, password);
      const firebaseUser = userCredential.user;

      // Get stored phone number if exists
      const phone = await storageService.get(`user_phone_${firebaseUser.uid}`);

      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        first_name: firebaseUser.displayName?.split(' ')[0] || '',
        last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        phone: phone || '',
        roles: ['customer'],
        authProvider: 'firebase'
      };

      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (firebaseError) {
      console.error('Firebase login also failed:', firebaseError.message);
      return { success: false, error: 'Invalid username/email or password' };
    }
  };

  const logout = async () => {
    // Logout from Firebase if using it
    if (user?.authProvider === 'firebase') {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error('Firebase logout error:', error);
      }
    }

    // Clear WordPress token
    await storageService.remove('wc_token');

    setUser(null);
    setIsAuthenticated(false);
  };

  // Delete user account (required by Apple App Store guidelines)
  const deleteAccount = async () => {
    try {
      if (user?.authProvider === 'firebase') {
        // Delete Firebase user
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Remove any stored user data
          await storageService.remove(`user_phone_${currentUser.uid}`);
          await storageService.remove(`addresses_${currentUser.uid}`);

          // Delete the Firebase user account
          await deleteUser(currentUser);
        }
      }

      // Clear all local data
      await storageService.remove('wc_token');

      setUser(null);
      setIsAuthenticated(false);

      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);

      // Handle re-authentication required error
      if (error.code === 'auth/requires-recent-login') {
        return {
          success: false,
          error: 'For security, please log out and log back in before deleting your account.'
        };
      }

      return { success: false, error: 'Failed to delete account. Please try again.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      logout,
      register,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);