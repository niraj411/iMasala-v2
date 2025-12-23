// src/components/admin/KitchenDisplay.jsx
// Kitchen Display for restaurant staff with swipe-to-ready functionality

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Clock, CheckCircle, ChefHat, Utensils, Phone, User,
  AlertCircle, Volume2, VolumeX, RefreshCw, Eye, X,
  ChevronRight, Flame, Package, Timer, Bell, Wifi, WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

// Swipeable Order Card Component
const SwipeableOrderCard = ({ order, onStatusUpdate, onViewDetails, nextStatus }) => {
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);

  // Transform x position to background color intensity (only green for right swipe)
  const background = useTransform(
    x,
    [0, 150],
    [
      'rgba(0, 0, 0, 0)',
      'rgba(34, 197, 94, 0.3)'  // Green for right swipe (complete)
    ]
  );

  const actionOpacity = useTransform(
    x,
    [0, 50, 100],
    [0, 0.5, 1]
  );

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold && nextStatus) {
      // Swipe right - move to next status (complete)
      onStatusUpdate(order.id, nextStatus);
      toast.success(`Order #${order.id} → ${nextStatus}`, {
        icon: '✓',
        style: { background: '#1f2937', color: '#fff' }
      });
    }
    // Left swipe disabled - no action
    setIsDragging(false);
  };

  const statusConfig = {
    'pending': { color: 'border-amber-500/50', bg: 'bg-amber-500/10', icon: Clock, iconColor: 'text-amber-400' },
    'processing': { color: 'border-blue-500/50', bg: 'bg-blue-500/10', icon: ChefHat, iconColor: 'text-blue-400' },
    'on-hold': { color: 'border-orange-500/50', bg: 'bg-orange-500/10', icon: AlertCircle, iconColor: 'text-orange-400' },
    'completed': { color: 'border-green-500/50', bg: 'bg-green-500/10', icon: CheckCircle, iconColor: 'text-green-400' },
  };

  const config = statusConfig[order.status] || statusConfig['pending'];
  const StatusIcon = config.icon;

  const orderType = order.meta_data?.find(m => m.key === 'order_type')?.value || 'pickup';
  const pickupTime = order.meta_data?.find(m => m.key === 'pickup_time' || m.key === 'scheduled_time')?.value;
  const orderNotes = order.customer_note;

  // Get tip amount from fee_lines or meta_data
  const tipFromFees = order.fee_lines?.find(f => f.name?.toLowerCase().includes('tip'))?.total;
  const tipFromMeta = order.meta_data?.find(m => m.key === 'tip_amount' || m.key === '_tip_amount')?.value;
  const tipAmount = parseFloat(tipFromFees || tipFromMeta || 0);

  // Calculate time since order
  const timeSinceOrder = () => {
    const created = new Date(order.date_created);
    const now = new Date();
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-2xl">
      {/* Swipe Indicator (right side only) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end px-6 pointer-events-none"
        style={{ opacity: actionOpacity }}
      >
        <div className="flex items-center gap-2 text-green-400">
          <span className="font-semibold">{nextStatus === 'processing' ? 'Start' : nextStatus === 'completed' ? 'Complete' : 'Done'}</span>
          <CheckCircle className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 150 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x, background }}
        whileTap={{ scale: 0.98 }}
        className={`relative backdrop-blur-xl bg-white/5 rounded-2xl border-2 ${config.color} p-4 cursor-grab active:cursor-grabbing`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">#{order.id}</span>
                {orderType === 'catering' && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-lg font-bold">
                    CATERING
                  </span>
                )}
              </div>
              <p className="text-sm text-white/50 font-medium flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" />
                {timeSinceOrder()}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(order);
            }}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <Eye className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-xl">
          <User className="w-4 h-4 text-white/40" />
          <span className="text-white font-medium">
            {order.billing?.first_name} {order.billing?.last_name}
          </span>
          {order.billing?.phone && (
            <a
              href={`tel:${order.billing.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Pickup Time */}
        {pickupTime && (
          <div className={`mb-3 p-2 rounded-xl flex items-center gap-2 ${
            pickupTime === 'ASAP' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="font-semibold text-sm">
              {pickupTime === 'ASAP' ? 'ASAP' : pickupTime}
            </span>
          </div>
        )}

        {/* Order Items */}
        <div className="space-y-2 mb-3">
          {order.line_items?.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <span className="font-bold text-orange-400 min-w-[24px]">{item.quantity}×</span>
              <div className="flex-1">
                <span className="text-white font-medium">{item.name}</span>
                {item.meta_data && item.meta_data.length > 0 && (
                  <div className="text-white/40 text-xs mt-0.5">
                    {item.meta_data.map((m, i) => (
                      <span key={i}>{m.display_value}{i < item.meta_data.length - 1 ? ' • ' : ''}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {orderNotes && (
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-3">
            <p className="text-xs text-yellow-400 font-medium">Note: {orderNotes}</p>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <span className="text-white/50 font-medium">Total</span>
            {tipAmount > 0 && (
              <span className="text-green-400 text-xs ml-2">(+${tipAmount.toFixed(2)} tip)</span>
            )}
          </div>
          <span className="text-xl font-bold text-white">${parseFloat(order.total).toFixed(2)}</span>
        </div>

        {/* Swipe Hint */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/30">
          <span>Swipe right to {nextStatus === 'processing' ? 'start' : 'complete'}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </motion.div>
    </div>
  );
};

// Quick Action Button
const QuickActionButton = ({ order, status, label, color, icon: Icon, onStatusUpdate }) => {
  const colors = {
    amber: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/30',
    blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30',
    red: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30',
    orange: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/30',
  };

  return (
    <button
      onClick={() => onStatusUpdate(order.id, status)}
      className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm border transition-all flex items-center justify-center gap-2 ${colors[color]}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};

// Main Kitchen Display Component
export default function KitchenDisplay({ orders, onStatusUpdate, onViewDetails, onRefresh, refreshing, smartRefresh, lastRefresh, isChecking }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const prevOrderIdsRef = useRef(new Set());
  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [soundEnabled]);

  // Smart auto-refresh - checks for new orders every 15 seconds
  useEffect(() => {
    if (!autoRefresh || !smartRefresh) return;

    const checkForNewOrders = async () => {
      try {
        setConnectionStatus('checking');
        const result = await smartRefresh();
        setConnectionStatus('connected');

        if (result.hasNewOrders) {
          playNotificationSound();
          toast('New order received!', {
            icon: '🔔',
            duration: 5000,
            style: { background: '#22c55e', color: '#fff', fontWeight: 600 }
          });
        }
      } catch (error) {
        setConnectionStatus('error');
      }
    };

    const interval = setInterval(checkForNewOrders, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, smartRefresh, playNotificationSound]);

  // Listen for push notifications (triggers immediate refresh)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handlePushNotification = () => {
      playNotificationSound();
      onRefresh();
      toast('New order notification received!', {
        icon: '🔔',
        duration: 3000,
        style: { background: '#22c55e', color: '#fff', fontWeight: 600 }
      });
    };

    // Listen for push notifications received while app is open
    const listener = PushNotifications.addListener('pushNotificationReceived', handlePushNotification);

    return () => {
      listener.then(l => l.remove());
    };
  }, [onRefresh, playNotificationSound]);

  // Detect new orders by comparing order IDs
  useEffect(() => {
    const currentIds = new Set(orders.map(o => o.id));
    const prevIds = prevOrderIdsRef.current;

    // Find new orders (IDs in current but not in previous)
    const newOrderIds = [...currentIds].filter(id => !prevIds.has(id));

    if (prevIds.size > 0 && newOrderIds.length > 0) {
      playNotificationSound();
    }

    prevOrderIdsRef.current = currentIds;
  }, [orders, playNotificationSound]);

  // Format last refresh time
  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - lastRefresh) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter orders by status
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const processingOrders = orders.filter(o => o.status === 'processing');
  const onHoldOrders = orders.filter(o => o.status === 'on-hold');
  const completedOrders = orders.filter(o => o.status === 'completed').slice(0, 5);

  const getNextStatus = (currentStatus) => {
    const flow = {
      'pending': 'processing',
      'processing': 'completed',
      'on-hold': 'processing',
    };
    return flow[currentStatus];
  };

  // Connection status indicator
  const statusConfig = {
    connected: { icon: Wifi, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Live' },
    checking: { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Checking' },
    error: { icon: WifiOff, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Offline' }
  };
  const status = statusConfig[connectionStatus];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Kitchen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-orange-400" />
            </div>
            Kitchen Display
          </h2>
          <div className="flex items-center gap-3 mt-2">
            {/* Connection Status */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${status.bg}`}>
              <StatusIcon className={`w-3.5 h-3.5 ${status.color} ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
              <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
            </div>
            {/* Last Refresh */}
            <span className="text-white/40 text-xs">
              Updated {formatLastRefresh()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
            title={soundEnabled ? 'Sound on' : 'Sound off'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2.5 rounded-xl border transition-all ${
              autoRefresh
                ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                : 'bg-white/5 border-white/10 text-white/40'
            }`}
            title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
          >
            <Bell className={`w-4 h-4`} />
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            disabled={refreshing || isChecking}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing || isChecking ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{pendingOrders.length}</p>
          <p className="text-xs text-amber-400/70 font-medium mt-1">NEW</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-400">{processingOrders.length}</p>
          <p className="text-xs text-blue-400/70 font-medium mt-1">COOKING</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-400">{onHoldOrders.length}</p>
          <p className="text-xs text-orange-400/70 font-medium mt-1">ON HOLD</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{completedOrders.length}</p>
          <p className="text-xs text-green-400/70 font-medium mt-1">READY</p>
        </div>
      </div>

      {/* Order Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Orders Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-amber-500/20">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="font-bold text-amber-400 uppercase tracking-wider text-sm">
              New Orders ({pendingOrders.length})
            </h3>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {pendingOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <SwipeableOrderCard
                    order={order}
                    onStatusUpdate={onStatusUpdate}
                    onViewDetails={onViewDetails}
                    nextStatus="processing"
                  />
                  <div className="flex gap-2 mt-2">
                    <QuickActionButton
                      order={order}
                      status="processing"
                      label="Start"
                      color="blue"
                      icon={ChefHat}
                      onStatusUpdate={onStatusUpdate}
                    />
                    <QuickActionButton
                      order={order}
                      status="on-hold"
                      label="Hold"
                      color="orange"
                      icon={AlertCircle}
                      onStatusUpdate={onStatusUpdate}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {pendingOrders.length === 0 && (
              <div className="text-center py-12 text-white/30">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No new orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Cooking Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-blue-500/20">
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
            <h3 className="font-bold text-blue-400 uppercase tracking-wider text-sm">
              Cooking ({processingOrders.length})
            </h3>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {processingOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                >
                  <SwipeableOrderCard
                    order={order}
                    onStatusUpdate={onStatusUpdate}
                    onViewDetails={onViewDetails}
                    nextStatus="completed"
                  />
                  <div className="flex gap-2 mt-2">
                    <QuickActionButton
                      order={order}
                      status="completed"
                      label="Ready"
                      color="green"
                      icon={CheckCircle}
                      onStatusUpdate={onStatusUpdate}
                    />
                    <QuickActionButton
                      order={order}
                      status="on-hold"
                      label="Hold"
                      color="orange"
                      icon={AlertCircle}
                      onStatusUpdate={onStatusUpdate}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {processingOrders.length === 0 && (
              <div className="text-center py-12 text-white/30">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nothing cooking</p>
              </div>
            )}
          </div>

          {/* On Hold Section */}
          {onHoldOrders.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 pb-3">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <h4 className="font-semibold text-orange-400 text-sm">On Hold ({onHoldOrders.length})</h4>
              </div>
              <div className="space-y-3">
                {onHoldOrders.map((order) => (
                  <div key={order.id} className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">#{order.id}</span>
                      <button
                        onClick={() => onStatusUpdate(order.id, 'processing')}
                        className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg font-semibold hover:bg-blue-500/30 transition-all"
                      >
                        Resume
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ready Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-green-500/20">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <h3 className="font-bold text-green-400 uppercase tracking-wider text-sm">
              Ready for Pickup ({completedOrders.length})
            </h3>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {completedOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-green-400">#{order.id}</span>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-white font-medium">
                    {order.billing?.first_name} {order.billing?.last_name}
                  </p>
                  <p className="text-green-400/70 text-sm mt-1">
                    {order.line_items?.length} items • ${parseFloat(order.total).toFixed(2)}
                  </p>
                  <button
                    onClick={() => onViewDetails(order)}
                    className="w-full mt-3 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm font-semibold hover:bg-green-500/30 transition-all"
                  >
                    View Details
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {completedOrders.length === 0 && (
              <div className="text-center py-12 text-white/30">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No orders ready</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
