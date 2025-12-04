// src/hooks/useNotifications.js
import { useEffect, useRef } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Hook to initialize and manage push notifications
 * Use this in App.jsx or a top-level component
 */
export function useNotifications() {
  const { user } = useAuth();
  const listenerRef = useRef(null);

  useEffect(() => {
    // Only set up if notifications are supported and permission granted
    if (!notificationService.isSupported()) return;
    if (notificationService.getPermissionStatus() !== 'granted') return;

    // Set up foreground message listener
    listenerRef.current = notificationService.onForegroundMessage((payload) => {
      console.log('Notification received in foreground:', payload);
      
      // Show toast for foreground notifications
      const title = payload.notification?.title || 'Tandoori Kitchen';
      const body = payload.notification?.body || '';
      
      // Use regular toast instead of custom JSX
      toast.success(title + (body ? '\n' + body : ''), {
        duration: 5000,
        icon: '🔔',
      });
    });

    // Re-register token if user is logged in (in case token was refreshed)
    if (user?.id || user?.email) {
      const existingToken = notificationService.getStoredToken();
      if (existingToken) {
        notificationService.saveCustomerToken(existingToken, user.id, user.email);
      }
    }

    return () => {
      // Cleanup listener on unmount
    };
  }, [user]);

  return {
    isSupported: notificationService.isSupported(),
    permissionStatus: notificationService.getPermissionStatus(),
    requestPermission: () => notificationService.requestPermission(user?.id, user?.email),
    requestAdminPermission: (email, name) => notificationService.requestAdminPermission(email, name),
    showTestNotification: () => notificationService.showLocalNotification(
      'Test Notification',
      'Push notifications are working! 🎉',
      { test: true }
    )
  };
}

export default useNotifications;