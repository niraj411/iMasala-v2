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
      
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-zinc-900 border border-white/10 shadow-lg rounded-xl pointer-events-auto flex`}
        >
          <div className="flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-white/60">{body}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/10">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full p-4 text-sm font-medium text-orange-400 hover:text-orange-300 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 5000,
      });
    });

    // Re-register token if user is logged in (in case token was refreshed)
    if (user?.id || user?.email) {
      const existingToken = notificationService.getStoredToken();
      if (existingToken) {
        notificationService.saveTokenToServer(existingToken, user.id || user.email);
      }
    }

    return () => {
      // Cleanup listener on unmount
      if (listenerRef.current) {
        // Note: Firebase doesn't provide unsubscribe for onMessage in the same way
        // The listener will be cleaned up when component unmounts
      }
    };
  }, [user]);

  return {
    isSupported: notificationService.isSupported(),
    permissionStatus: notificationService.getPermissionStatus(),
    requestPermission: () => notificationService.requestPermission(user?.id || user?.email),
    showTestNotification: () => notificationService.showLocalNotification(
      'Test Notification',
      'Push notifications are working! 🎉',
      { test: true }
    )
  };
}

export default useNotifications;