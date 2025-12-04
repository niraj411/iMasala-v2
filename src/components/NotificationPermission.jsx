// src/components/NotificationPermission.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Check, Loader2 } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Notification permission prompt - shows after user logs in or places order
 */
export default function NotificationPermission({ 
  show = false, 
  onClose,
  variant = 'modal' // 'modal' | 'banner' | 'inline'
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    setPermissionStatus(notificationService.getPermissionStatus());
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const token = await notificationService.requestPermission(user?.id || user?.email);
      
      if (token) {
        setPermissionStatus('granted');
        toast.success('Notifications enabled! 🔔');
        onClose?.();
      } else {
        setPermissionStatus(notificationService.getPermissionStatus());
        if (notificationService.getPermissionStatus() === 'denied') {
          toast.error('Please enable notifications in browser settings');
        }
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Could not enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    // Remember that user dismissed (don't show again for 7 days)
    localStorage.setItem('notification_prompt_dismissed', Date.now().toString());
    onClose?.();
  };

  // Don't render if not supported
  if (!notificationService.isSupported()) {
    return null;
  }

  // Don't render if already granted
  if (permissionStatus === 'granted') {
    return null;
  }

  // Banner variant - slim bar at top/bottom
  if (variant === 'banner') {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 shadow-lg"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Get notified when your order is ready!
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEnable}
                  disabled={loading}
                  className="px-4 py-1.5 bg-white text-orange-600 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enable'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Inline variant - embedded in page
  if (variant === 'inline') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">Enable Notifications</h4>
            <p className="text-white/60 text-sm mb-3">
              Get real-time updates on your order status
            </p>
            <button
              onClick={handleEnable}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Enable Notifications
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal variant (default) - centered popup
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/40" />
              </button>

              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Bell className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white text-center mb-2">
                Stay Updated!
              </h3>
              <p className="text-white/60 text-center mb-6">
                Get notified when your order is being prepared, ready for pickup, or when we have special offers!
              </p>

              {/* Benefits */}
              <div className="space-y-2 mb-6">
                {[
                  'Order ready notifications',
                  'Exclusive deals & offers',
                  'Catering updates'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-green-400" />
                    {benefit}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleEnable}
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enabling...
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      Enable Notifications
                    </>
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl font-medium transition-colors"
                >
                  Maybe Later
                </button>
              </div>

              {permissionStatus === 'denied' && (
                <p className="text-amber-400 text-xs text-center mt-4">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage notification prompt visibility
 */
export function useNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if should show prompt
    const checkShouldShow = () => {
      // Don't show if not supported
      if (!notificationService.isSupported()) return false;
      
      // Don't show if already granted
      if (Notification.permission === 'granted') return false;
      
      // Don't show if denied (user must go to settings)
      if (Notification.permission === 'denied') return false;
      
      // Don't show if dismissed recently (7 days)
      const dismissed = localStorage.getItem('notification_prompt_dismissed');
      if (dismissed) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) return false;
      }
      
      return true;
    };

    if (checkShouldShow()) {
      // Delay showing prompt a bit for better UX
      const timer = setTimeout(() => setShowPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    showPrompt,
    closePrompt: () => setShowPrompt(false),
    openPrompt: () => setShowPrompt(true)
  };
}