// src/components/admin/AdminNotificationSetup.jsx
// Self-contained - no external notification service dependency
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, BellRing, BellOff, X, Loader2, 
  Smartphone, Volume2, AlertCircle, CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Firebase imports
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

// Firebase config - update with your actual values
const firebaseConfig = {
    apiKey: "AIzaSyByYH4FwC9R6hQGSuK52s5LaHFIAm2yqWU",
    authDomain: "imasala-37b4d.firebaseapp.com",
    projectId: "imasala-37b4d",
    storageBucket: "imasala-37b4d.firebasestorage.app",
    messagingSenderId: "483793848610",
    appId: "1:483793848610:web:c0560b717161fc644c3d7b",
    measurementId: "G-ZW43QH5VD5"
  };

// VAPID key for web push - this is already configured
const VAPID_KEY = 'BAYiphZs1LM-QbQZeCPmJMnD2iUyLQJICexnaOcHfgVccCM8TlcgEVPuk82ClqtcBjQoE7Xu4z6XS75AYqbpZG0';

// API URL from environment
const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || 'https://tandoorikitchenco.com';

export default function AdminNotificationSetup({ compact = false }) {
  const { user } = useAuth();
  const [status, setStatus] = useState('checking'); // checking, unsupported, denied, prompt, enabled
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [lastRegistered, setLastRegistered] = useState(null);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    setStatus('checking');
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }

    // Check current permission
    const permission = Notification.permission;
    
    if (permission === 'denied') {
      setStatus('denied');
      return;
    }

    if (permission === 'granted') {
      // Check if we have a registered token
      const existingToken = localStorage.getItem('admin_fcm_token');
      if (existingToken) {
        setToken(existingToken);
        setLastRegistered(localStorage.getItem('admin_fcm_registered_at'));
        setStatus('enabled');
      } else {
        setStatus('prompt');
      }
      return;
    }

    setStatus('prompt');
  };

  const initializeFirebase = async () => {
    try {
      // Initialize Firebase app
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }

      // Register service worker first
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);

      // Get messaging instance
      const messaging = getMessaging(app);

      // Get FCM token
      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      return fcmToken;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  };

  const enableNotifications = async () => {
    setLoading(true);
    
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setStatus('denied');
        toast.error('Notification permission denied');
        setLoading(false);
        return;
      }

      // Initialize Firebase and get token
      const fcmToken = await initializeFirebase();
      
      if (!fcmToken) {
        throw new Error('Failed to get notification token');
      }

      console.log('FCM Token obtained:', fcmToken.substring(0, 30) + '...');

      // Register as admin token
      const adminEmail = user?.email || 'admin@tandoorikitchenco.com';
      const response = await fetch(`${WORDPRESS_URL}/wp-json/imasala/v1/register-admin-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
          email: adminEmail,
          platform: 'web'
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to register admin token');
      }

      // Save token locally
      const now = new Date().toISOString();
      localStorage.setItem('admin_fcm_token', fcmToken);
      localStorage.setItem('admin_fcm_registered_at', now);
      
      setToken(fcmToken);
      setLastRegistered(now);
      setStatus('enabled');
      
      toast.success('Order notifications enabled!');
      
      // Show a test notification
      new Notification('Notifications Enabled! 🔔', {
        body: 'You will now receive alerts for new orders.',
        icon: '/logo192.png'
      });

    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error(error.message || 'Failed to enable notifications');
      setStatus('prompt');
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = async () => {
    setLoading(true);
    
    try {
      const fcmToken = localStorage.getItem('admin_fcm_token');
      
      if (fcmToken) {
        // Unregister token from server
        await fetch(`${WORDPRESS_URL}/wp-json/imasala/v1/unregister-push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: fcmToken })
        });
      }

      // Clear local storage
      localStorage.removeItem('admin_fcm_token');
      localStorage.removeItem('admin_fcm_registered_at');
      
      setToken(null);
      setLastRegistered(null);
      setStatus('prompt');
      
      toast.success('Notifications disabled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    setLoading(true);
    
    try {
      const fcmToken = await initializeFirebase();
      
      if (!fcmToken) {
        throw new Error('Failed to get new token');
      }

      const adminEmail = user?.email || 'admin@tandoorikitchenco.com';
      const response = await fetch(`${WORDPRESS_URL}/wp-json/imasala/v1/register-admin-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: fcmToken,
          email: adminEmail,
          platform: 'web'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const now = new Date().toISOString();
      localStorage.setItem('admin_fcm_token', fcmToken);
      localStorage.setItem('admin_fcm_registered_at', now);
      
      setToken(fcmToken);
      setLastRegistered(now);
      
      toast.success('Token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast.error('Failed to refresh token');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${WORDPRESS_URL}/wp-json/imasala/v1/test-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'admin' })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Test notification sent! Check your device.');
      } else {
        toast.error(result.message || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test:', error);
      toast.error('Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  // Compact version for header/sidebar
  if (compact) {
    return (
      <button
        onClick={status === 'enabled' ? sendTestNotification : enableNotifications}
        disabled={loading || status === 'unsupported' || status === 'denied'}
        className={`relative p-2 rounded-xl transition-all ${
          status === 'enabled'
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            : status === 'denied' || status === 'unsupported'
            ? 'bg-white/5 text-white/30 cursor-not-allowed'
            : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
        }`}
        title={
          status === 'enabled' ? 'Notifications enabled - Click to test' :
          status === 'denied' ? 'Notifications blocked in browser' :
          status === 'unsupported' ? 'Notifications not supported' :
          'Enable order notifications'
        }
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === 'enabled' ? (
          <BellRing className="w-5 h-5" />
        ) : status === 'denied' || status === 'unsupported' ? (
          <BellOff className="w-5 h-5" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {status === 'prompt' && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
        )}
      </button>
    );
  }

  // Full card version
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            status === 'enabled' 
              ? 'bg-green-500/20' 
              : status === 'denied' || status === 'unsupported'
              ? 'bg-red-500/20'
              : 'bg-orange-500/20'
          }`}>
            {status === 'enabled' ? (
              <BellRing className="w-6 h-6 text-green-400" />
            ) : status === 'denied' || status === 'unsupported' ? (
              <BellOff className="w-6 h-6 text-red-400" />
            ) : (
              <Bell className="w-6 h-6 text-orange-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Order Notifications</h3>
            <p className="text-sm text-white/40">
              Get instant alerts when new orders come in
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <AnimatePresence mode="wait">
        {status === 'checking' && (
          <motion.div
            key="checking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-4"
          >
            <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
            <span className="text-white/60">Checking notification status...</span>
          </motion.div>
        )}

        {status === 'unsupported' && (
          <motion.div
            key="unsupported"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-300 font-medium">Notifications not supported</p>
              <p className="text-red-300/60 text-sm">Your browser doesn't support push notifications</p>
            </div>
          </motion.div>
        )}

        {status === 'denied' && (
          <motion.div
            key="denied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-4"
          >
            <X className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-300 font-medium">Notifications blocked</p>
              <p className="text-red-300/60 text-sm">
                Please enable notifications in your browser settings
              </p>
            </div>
          </motion.div>
        )}

        {status === 'prompt' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <Smartphone className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-orange-300 font-medium">Enable notifications</p>
                <p className="text-orange-300/60 text-sm">
                  Never miss a new order - get instant browser alerts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white/5 rounded-xl">
                <BellRing className="w-5 h-5 text-white/60 mx-auto mb-1" />
                <p className="text-xs text-white/40">Instant Alerts</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <Volume2 className="w-5 h-5 text-white/60 mx-auto mb-1" />
                <p className="text-xs text-white/40">Sound Notification</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <Smartphone className="w-5 h-5 text-white/60 mx-auto mb-1" />
                <p className="text-xs text-white/40">Works in Background</p>
              </div>
            </div>

            <button
              onClick={enableNotifications}
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" />
                  Enable Order Alerts
                </>
              )}
            </button>
          </motion.div>
        )}

        {status === 'enabled' && (
          <motion.div
            key="enabled"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div className="flex-1">
                <p className="text-green-300 font-medium">Notifications enabled</p>
                <p className="text-green-300/60 text-sm">
                  You'll receive alerts for all new orders
                </p>
              </div>
            </div>

            {lastRegistered && (
              <p className="text-xs text-white/30 text-center">
                Registered: {new Date(lastRegistered).toLocaleString()}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={sendTestNotification}
                disabled={loading}
                className="py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Test
              </button>
              
              <button
                onClick={refreshToken}
                disabled={loading}
                className="py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Refresh
              </button>
            </div>

            <button
              onClick={disableNotifications}
              disabled={loading}
              className="w-full py-2 text-white/40 hover:text-red-400 text-sm font-medium transition-colors"
            >
              Disable notifications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}