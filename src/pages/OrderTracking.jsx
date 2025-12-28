// src/pages/OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  Search, Package, Clock, CheckCircle, ChefHat, Truck,
  MapPin, Phone, Mail, ArrowLeft, RefreshCw, AlertCircle,
  ShoppingBag, XCircle
} from 'lucide-react';
import { woocommerceService } from '../services/woocommerceService';
import { storageService } from '../services/storageService';

// Order status steps
const ORDER_STATUSES = {
  'pending': { step: 0, label: 'Pending', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  'on-hold': { step: 0, label: 'On Hold', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  'processing': { step: 1, label: 'Preparing', icon: ChefHat, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  'ready': { step: 2, label: 'Ready for Pickup', icon: Package, color: 'text-green-400', bg: 'bg-green-500/20' },
  'completed': { step: 3, label: 'Completed', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  'cancelled': { step: -1, label: 'Cancelled', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  'refunded': { step: -1, label: 'Refunded', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  'failed': { step: -1, label: 'Failed', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
};

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orderId: routeOrderId } = useParams();

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);

  // Load from URL params or localStorage on mount
  useEffect(() => {
    const urlOrderId = routeOrderId || searchParams.get('order_id');
    const urlEmail = searchParams.get('email');

    const initializeForm = async () => {
      if (urlOrderId) {
        setOrderId(urlOrderId);

        // Try to get email from localStorage first
        const storedEmail = await storageService.get('guest_checkout_email');

        if (urlEmail) {
          setEmail(urlEmail);
          lookupOrder(urlOrderId, urlEmail);
        } else if (storedEmail) {
          setEmail(storedEmail);
          // Pre-fill email but don't auto-lookup - let user confirm
        }
      }

      // Load recent guest orders from localStorage
      loadRecentOrders();
    };

    initializeForm();
  }, [searchParams, routeOrderId]);

  const loadRecentOrders = async () => {
    try {
      const stored = await storageService.get('guest_orders');
      if (stored) {
        const orders = JSON.parse(stored);
        // Filter to only show orders from last 7 days
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recent = orders.filter(o => o.timestamp > weekAgo);
        setRecentOrders(recent);
      }
    } catch (e) {
      console.error('Error loading recent orders:', e);
    }
  };

  const lookupOrder = async (id, emailToVerify) => {
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const orderData = await woocommerceService.getOrder(id);

      // Verify email matches for security
      if (orderData.billing?.email?.toLowerCase() !== emailToVerify.toLowerCase()) {
        setError('Email does not match the order. Please check your details.');
        setLoading(false);
        return;
      }

      setOrder(orderData);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Order not found. Please check your order number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) {
      setError('Please enter both order number and email');
      return;
    }
    lookupOrder(orderId.trim(), email.trim());
  };

  const handleRecentOrderClick = async (recentOrder) => {
    setOrderId(recentOrder.orderId);
    setEmail(recentOrder.email);
    await lookupOrder(recentOrder.orderId, recentOrder.email);
  };

  const refreshOrder = () => {
    if (orderId && email) {
      lookupOrder(orderId, email);
    }
  };

  const getStatusInfo = (status) => {
    return ORDER_STATUSES[status] || ORDER_STATUSES['pending'];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Track Your Order
          </h1>
          <p className="text-white/50 font-medium">
            Enter your order details to check the status
          </p>
        </motion.div>

        {/* Lookup Form */}
        {!order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      Order Number
                    </label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="e.g., 12345"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 px-6 py-4 bg-white hover:bg-white/90 text-black rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Track Order
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                  Recent Orders
                </h3>
                <div className="space-y-2">
                  {recentOrders.map((recentOrder, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentOrderClick(recentOrder)}
                      className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="text-white font-semibold">Order #{recentOrder.orderId}</span>
                        <span className="text-white/40 text-sm ml-2">
                          {new Date(recentOrder.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-white/40 rotate-180" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Order Details */}
        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Status Card */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Order #{order.id}</h2>
                    <p className="text-white/40 text-sm font-medium">{formatDate(order.date_created)}</p>
                  </div>
                  <button
                    onClick={refreshOrder}
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    title="Refresh status"
                  >
                    <RefreshCw className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Status Badge */}
                {(() => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 ${statusInfo.bg} rounded-full mb-6`}>
                      <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                  );
                })()}

                {/* Progress Steps */}
                {getStatusInfo(order.status).step >= 0 && (
                  <div className="relative">
                    <div className="flex justify-between mb-2">
                      {['Received', 'Preparing', 'Ready', 'Complete'].map((step, index) => {
                        const currentStep = getStatusInfo(order.status).step;
                        const isActive = index <= currentStep;
                        const isCurrent = index === currentStep;

                        return (
                          <div key={step} className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all ${
                              isActive
                                ? isCurrent
                                  ? 'bg-orange-500 text-white ring-4 ring-orange-500/30'
                                  : 'bg-green-500 text-white'
                                : 'bg-white/10 text-white/30'
                            }`}>
                              {isActive && !isCurrent ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <span className="text-sm font-bold">{index + 1}</span>
                              )}
                            </div>
                            <span className={`text-xs font-medium text-center ${
                              isActive ? 'text-white' : 'text-white/30'
                            }`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 -z-10">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${(getStatusInfo(order.status).step / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.line_items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-start py-2 border-b border-white/5 last:border-0">
                      <div className="flex-1">
                        <span className="text-white font-medium">{item.name}</span>
                        <span className="text-white/40 ml-2">x{item.quantity}</span>
                        {item.meta_data?.filter(m => !m.key.startsWith('_')).map((meta, i) => (
                          <p key={i} className="text-xs text-white/40">
                            {meta.key}: {meta.value}
                          </p>
                        ))}
                      </div>
                      <span className="text-white font-semibold">${parseFloat(item.total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>${parseFloat(order.total - order.total_tax).toFixed(2)}</span>
                  </div>
                  {parseFloat(order.total_tax) > 0 && (
                    <div className="flex justify-between text-white/60">
                      <span>Tax</span>
                      <span>${parseFloat(order.total_tax).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-lg pt-2">
                    <span>Total</span>
                    <span>${parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Pickup Info */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Pickup Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Tandoori Kitchen</p>
                      <p className="text-white/50 text-sm">199 W South Boulder Rd, Lafayette, CO 80026</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Phone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Questions?</p>
                      <a href="tel:+13036658530" className="text-white/50 text-sm hover:text-orange-400 transition-colors">
                        (303) 665-8530
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={() => {
                  setOrder(null);
                  setOrderId('');
                  setEmail('');
                }}
                className="w-full px-6 py-3 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Track Another Order
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
