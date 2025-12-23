// src/services/pushNotificationService.js
// Unified push notification service for web and native platforms
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyByYH4FwC9R6hQGSuK52s5LaHFIAm2yqWU",
  authDomain: "imasala-37b4d.firebaseapp.com",
  projectId: "imasala-37b4d",
  storageBucket: "imasala-37b4d.firebasestorage.app",
  messagingSenderId: "483793848610",
  appId: "1:483793848610:web:c0560b717161fc644c3d7b",
  measurementId: "G-ZW43QH5VD5"
};

// VAPID key for web push
const VAPID_KEY = 'BAYiphZs1LM-QbQZeCPmJMnD2iUyLQJICexnaOcHfgVccCM8TlcgEVPuk82ClqtcBjQoE7Xu4z6XS75AYqbpZG0';

// API URL
const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || 'https://tandoorikitchenco.com';

class PushNotificationService {
  constructor() {
    this.platform = Capacitor.getPlatform(); // 'web', 'ios', 'android'
    this.isNative = Capacitor.isNativePlatform();
    this.token = null;
    this.listeners = [];
  }

  // Check if push notifications are supported
  async isSupported() {
    if (this.isNative) {
      return true;
    }
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current permission status
  async getPermissionStatus() {
    if (this.isNative) {
      const result = await PushNotifications.checkPermissions();
      return result.receive; // 'prompt', 'granted', 'denied'
    }

    if (!('Notification' in window)) {
      return 'denied';
    }

    return Notification.permission;
  }

  // Request permission
  async requestPermission() {
    if (this.isNative) {
      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Initialize and get token
  async initialize() {
    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      throw new Error('Push notification permission denied');
    }

    if (this.isNative) {
      return this.initializeNative();
    }

    return this.initializeWeb();
  }

  // Initialize for native platforms (iOS/Android)
  async initializeNative() {
    return new Promise((resolve, reject) => {
      // Register with Apple / Google to receive push notifications
      PushNotifications.register();

      // Handle registration success
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, APNs/Device token: ' + token.value);

        // For iOS/Android, get the FCM token instead of raw device token
        try {
          // Small delay to allow Firebase SDK to process the APNs token
          await new Promise(r => setTimeout(r, 500));

          const fcmResult = await FCM.getToken();
          const fcmToken = fcmResult.token;
          console.log('FCM token obtained: ' + fcmToken);

          this.token = fcmToken;

          // Store FCM token locally
          localStorage.setItem('push_token', fcmToken);
          localStorage.setItem('push_platform', this.platform);

          resolve(fcmToken);
        } catch (fcmError) {
          console.error('Error getting FCM token, falling back to device token:', fcmError);
          // Fallback to device token if FCM fails
          this.token = token.value;
          localStorage.setItem('push_token', token.value);
          localStorage.setItem('push_platform', this.platform);
          resolve(token.value);
        }
      });

      // Handle registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
        reject(new Error('Failed to register for push notifications'));
      });

      // Handle push notification received while app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
        this.notifyListeners('received', notification);
      });

      // Handle push notification action (user tapped on notification)
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
        this.notifyListeners('action', notification);
      });
    });
  }

  // Initialize for web using Firebase
  async initializeWeb() {
    try {
      // Initialize Firebase app
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);

      // Get messaging instance
      const messaging = getMessaging(app);

      // Get FCM token
      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      this.token = fcmToken;

      // Store token locally
      localStorage.setItem('push_token', fcmToken);
      localStorage.setItem('push_platform', 'web');

      return fcmToken;
    } catch (error) {
      console.error('Web push initialization error:', error);
      throw error;
    }
  }

  // Register token with backend
  async registerWithBackend(email, isAdmin = false) {
    if (!this.token) {
      throw new Error('No push token available');
    }

    const endpoint = isAdmin
      ? `${WORDPRESS_URL}/wp-json/imasala/v1/register-admin-token`
      : `${WORDPRESS_URL}/wp-json/imasala/v1/register-push-token`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: this.token,
        email: email,
        platform: this.platform // 'web', 'ios', 'android'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to register push token');
    }

    return result;
  }

  // Unregister token from backend
  async unregisterFromBackend() {
    const token = this.token || localStorage.getItem('push_token');

    if (!token) {
      return;
    }

    try {
      await fetch(`${WORDPRESS_URL}/wp-json/imasala/v1/unregister-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Error unregistering token:', error);
    }

    // Clear local storage
    localStorage.removeItem('push_token');
    localStorage.removeItem('push_platform');
    localStorage.removeItem('admin_fcm_token');
    localStorage.removeItem('admin_fcm_registered_at');

    this.token = null;
  }

  // Add listener for push events
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notify all listeners
  notifyListeners(type, data) {
    this.listeners.forEach(listener => {
      try {
        listener(type, data);
      } catch (error) {
        console.error('Error in push notification listener:', error);
      }
    });
  }

  // Get stored token
  getStoredToken() {
    return localStorage.getItem('push_token');
  }

  // Get platform info
  getPlatformInfo() {
    return {
      platform: this.platform,
      isNative: this.isNative,
      hasToken: !!this.token || !!this.getStoredToken()
    };
  }

  // Clean up listeners (call when component unmounts)
  async cleanup() {
    if (this.isNative) {
      await PushNotifications.removeAllListeners();
    }
    this.listeners = [];
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
