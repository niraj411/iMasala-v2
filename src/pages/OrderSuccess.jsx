// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, User, ArrowRight, Clock, MapPin, Phone, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../services/storageService';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Clear the cart on successful order
    clearCart();

    // Get order details from URL params
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');

    if (orderId) {
      setOrderDetails({ orderId });

      // Save to localStorage for guest order tracking
      if (!user) {
        saveGuestOrder(orderId);
      }
    } else if (sessionId) {
      // Generate a temporary reference if no order ID
      setOrderDetails({ orderId: sessionId.slice(-8).toUpperCase() });
    }
  }, [clearCart, searchParams, user]);

  const saveGuestOrder = async (orderId) => {
    try {
      // Get email from localStorage (saved during checkout)
      const guestEmail = await storageService.get('guest_checkout_email');

      // Get existing guest orders
      const existingOrders = await storageService.get('guest_orders');
      let orders = existingOrders ? JSON.parse(existingOrders) : [];

      // Add new order
      orders.unshift({
        orderId: orderId,
        email: guestEmail || '',
        timestamp: Date.now()
      });

      // Keep only last 10 orders
      orders = orders.slice(0, 10);

      await storageService.set('guest_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving guest order:', e);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full"
      >
        {/* Success Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <CheckCircle className="w-10 h-10 text-green-400" strokeWidth={2} />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-3 tracking-tight"
          >
            Order Confirmed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 mb-6 font-medium"
          >
            Thank you for your order! We've received your payment and are preparing your food.
          </motion.p>

          {orderDetails?.orderId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6"
            >
              <span className="text-white/50 text-sm font-medium">Order Reference:</span>
              <span className="text-white font-bold">#{orderDetails.orderId}</span>
            </motion.div>
          )}

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 gap-3 mb-8"
          >
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-white/40 font-medium">Estimated Ready</p>
                  <p className="text-white font-semibold">20-30 minutes</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-white/40 font-medium">Pickup Location</p>
                  <p className="text-white font-semibold">199 W South Boulder Rd, Lafayette</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Phone className="w-5 h-5 text-green-400" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-white/40 font-medium">Questions?</p>
                  <a href="tel:+13036658530" className="text-white font-semibold hover:text-orange-400 transition-colors">
                    (303) 665-8530
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-white/40 mb-8 font-medium"
          >
            You'll receive an email confirmation shortly with your order details.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            {user ? (
              <button
                onClick={() => navigate('/my-account')}
                className="w-full px-6 py-4 backdrop-blur-xl bg-white hover:bg-white/90 text-black rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" strokeWidth={2} />
                View My Orders
              </button>
            ) : (
              <button
                onClick={() => navigate(orderDetails?.orderId ? `/order/${orderDetails.orderId}` : '/track-order')}
                className="w-full px-6 py-4 backdrop-blur-xl bg-white hover:bg-white/90 text-black rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" strokeWidth={2} />
                Track My Order
              </button>
            )}
            <button
              onClick={() => navigate('/shop')}
              className="w-full px-6 py-3 border border-white/10 text-white/70 hover:text-white hover:bg-white/5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              Continue Shopping
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </motion.div>
        </div>

        {/* Bottom Branding */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/30 text-sm mt-6 font-medium"
        >
          Tandoori Kitchen • Authentic Indian Cuisine
        </motion.p>
      </motion.div>
    </div>
  );
}
