// src/services/notificationService.js
import { messaging, getToken, onMessage, VAPID_KEY } from '../config/firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://tandoorikitchenco.com';
const TOKEN_STORAGE_KEY = 'fcm_token';
const ADMIN_TOKEN_KEY = 'fcm_admin_token';

export const notificationService = {
  /**
   * Check if notifications are supported
   */
  isSupported() {
    return 'Notification' in window && 
           'serviceWorker' in navigator && 
           'PushManager' in window;
  },

  /**
   * Get current permission status
   */
  getPermissionStatus() {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  /**
   * Request permission and get FCM token for CUSTOMERS
   */
  async requestPermission(userId = null, userEmail = null) {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);

      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service worker registered');

      await navigator.serviceWorker.ready;

      if (!messaging) {
        console.error('Firebase messaging not initialized');
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('FCM Token obtained:', token.substring(0, 20) + '...');
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        
        // Register with backend as CUSTOMER
        await this.saveCustomerToken(token, userId, userEmail);
        
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  },

  /**
   * Request permission and register as ADMIN/STAFF
   */
  async requestAdminPermission(adminEmail, adminName = 'Staff') {
    if (!this.isSupported()) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready;

      if (!messaging) {
        console.error('Firebase messaging not initialized');
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('Admin FCM Token obtained');
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        
        // Register with backend as ADMIN
        await this.saveAdminToken(token, adminEmail, adminName);
        
        return token;
      }
      
      return null;
    } catch (error) {
      console.error('Error requesting admin notification permission:', error);
      return null;
    }
  },

  /**
   * Save CUSTOMER token to backend
   */
  async saveCustomerToken(token, userId = null, userEmail = null) {
    try {
      const response = await axios.post(
        `${API_URL}/wp-json/imasala/v1/register-push-token`,
        {
          token,
          userId: userId || userEmail,
          userEmail: userEmail || userId,
          platform: 'web',
          userAgent: navigator.userAgent
        }
      );
      console.log('Customer token saved:', response.data);
      return response.data;
    } catch (error) {
      console.warn('Could not save customer token:', error.message);
      return null;
    }
  },

  /**
   * Save ADMIN token to backend
   */
  async saveAdminToken(token, adminEmail, adminName = 'Staff') {
    try {
      const response = await axios.post(
        `${API_URL}/wp-json/imasala/v1/register-admin-token`,
        {
          token,
          adminEmail,
          adminName,
          platform: 'web'
        }
      );
      console.log('Admin token saved:', response.data);
      return response.data;
    } catch (error) {
      console.warn('Could not save admin token:', error.message);
      return null;
    }
  },

  /**
   * Get stored token
   */
  getStoredToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  /**
   * Get stored admin token
   */
  getStoredAdminToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  /**
   * Remove token from server
   */
  async removeToken() {
    const token = this.getStoredToken() || this.getStoredAdminToken();
    if (!token) return;

    try {
      await axios.post(`${API_URL}/wp-json/imasala/v1/unregister-push-token`, { token });
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      console.log('Token removed');
    } catch (error) {
      console.warn('Could not remove token:', error.message);
    }
  },

  /**
   * Listen for foreground messages
   */
  onForegroundMessage(callback) {
    if (!messaging) return () => {};

    return onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload);
      
      // Show notification for foreground
      if (Notification.permission === 'granted') {
        const notification = new Notification(
          payload.notification?.title || 'Tandoori Kitchen',
          {
            body: payload.notification?.body,
            icon: '/logo192.png',
            data: payload.data
          }
        );

        notification.onclick = () => {
          window.focus();
          if (payload.data?.url) {
            window.location.href = payload.data.url;
          } else if (payload.data?.orderId) {
            window.location.href = `/account`;
          }
          notification.close();
        };
      }

      if (callback) callback(payload);
    });
  },

  /**
   * Test notification (for debugging)
   */
  async testNotification(type = 'customer', email = null) {
    try {
      const response = await axios.post(
        `${API_URL}/wp-json/imasala/v1/test-notification`,
        { type, email }
      );
      console.log('Test notification result:', response.data);
      return response.data;
    } catch (error) {
      console.error('Test notification failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Show local notification (for testing)
   */
  async showLocalNotification(title, body, data = {}) {
    if (Notification.permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: '/logo192.png',
      data,
      vibrate: [100, 50, 100]
    });
  }
};

export default notificationService;