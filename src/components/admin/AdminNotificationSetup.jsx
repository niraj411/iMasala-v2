// src/components/admin/AdminNotificationSetup.jsx
// Use this component in your admin dashboard to register staff devices for order alerts

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellRing, Check, AlertCircle, Loader2, TestTube } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import toast from 'react-hot-toast';

export default function AdminNotificationSetup({ adminEmail, adminName = 'Staff' }) {
  const [status, setStatus] = useState('unknown'); // 'unknown', 'enabled', 'disabled', 'unsupported'
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = () => {
    if (!notificationService.isSupported()) {
      setStatus('unsupported');
      return;
    }

    const permission = notificationService.getPermissionStatus();
    const hasToken = !!notificationService.getStoredAdminToken();

    if (permission === 'granted' && hasToken) {
      setStatus('enabled');
    } else if (permission === 'denied') {
      setStatus('blocked');
    } else {
      setStatus('disabled');
    }
  };

  const handleEnable = async () => {
    if (!adminEmail) {
      toast.error('Admin email is required');
      return;
    }

    setLoading(true);
    try {
      const token = await notificationService.requestAdminPermission(adminEmail, adminName);
      
      if (token) {
        setStatus('enabled');
        toast.success('🔔 You will now receive new order alerts!');
      } else {
        checkStatus();
        if (notificationService.getPermissionStatus() === 'denied') {
          toast.error('Please enable notifications in browser settings');
        }
      }
    } catch (error) {
      console.error('Error enabling admin notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await notificationService.testNotification('admin');
      
      if (result.success) {
        toast.success('Test notification sent! Check your device.');
      } else {
        toast.error(result.message || 'Test failed');
      }
    } catch (error) {
      toast.error('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleDisable = async () => {
    await notificationService.removeToken();
    setStatus('disabled');
    toast.success('Notifications disabled');
  };

  // Unsupported browser
  if (status === 'unsupported') {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <div>
            <p className="font-medium text-amber-400">Browser Not Supported</p>
            <p className="text-sm text-amber-400/70">
              Push notifications require a modern browser (Chrome, Firefox, Edge, Safari 16+)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Blocked by browser
  if (status === 'blocked') {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Notifications Blocked</p>
            <p className="text-sm text-red-400/70">
              Please enable notifications in your browser settings, then refresh the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Enabled
  if (status === 'enabled') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Order Alerts Enabled
              </p>
              <p className="text-sm text-green-400/70">
                You'll receive notifications for new orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              Test
            </button>
            <button
              onClick={handleDisable}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg text-sm transition-colors"
            >
              Disable
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not enabled
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-5"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <Bell className="w-6 h-6 text-orange-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Enable Order Alerts</h3>
          <p className="text-white/60 text-sm mb-4">
            Get instant notifications when new orders come in - even when the browser is closed!
          </p>
          
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <Check className="w-4 h-4 text-orange-400" />
              New pickup order alerts
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Check className="w-4 h-4 text-orange-400" />
              New catering request alerts
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Check className="w-4 h-4 text-orange-400" />
              Works even when browser is closed
            </div>
          </div>

          <button
            onClick={handleEnable}
            disabled={loading}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
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
        </div>
      </div>
    </motion.div>
  );
}