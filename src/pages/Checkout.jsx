// src/pages/Checkout.jsx - Modern Design
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Truck, Clock, AlertCircle, ChevronRight, 
  MapPin, Users, Utensils, Package, Store, Check, 
  Calendar, Zap, Shield, CreditCard, ChevronDown
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCatering } from '../contexts/CateringContext';
import { cartSyncService } from '../services/cartSyncService';
import { taxExemptionService } from '../services/taxExemptionService';
import CateringOrderForm from '../components/catering/CateringOrderForm';
import { woocommerceService } from '../services/woocommerceService';
import { stripeService } from '../services/stripeService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { cartItems, getCartTotal, orderType, setOrderType } = useCart();
  const { user } = useAuth();
  const { 
    cateringDetails, 
    validateCateringOrder, 
    isCateringOrder,
    setIsCateringOrder 
  } = useCatering();
  const navigate = useNavigate();
  
  // Order type and timing states
  const [selectedOrderType, setSelectedOrderType] = useState('pickup');
  const [orderTiming, setOrderTiming] = useState('asap');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Other states
  const [taxExemptStatus, setTaxExemptStatus] = useState(null);
  const [applyTaxExempt, setApplyTaxExempt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Calculate totals
  const cartTotal = getCartTotal();
  const deliveryFee = selectedOrderType === 'catering' ? 20 : 0;
  const taxRate = (taxExemptStatus?.verified && applyTaxExempt) ? 0 : 0.0825;
  const taxAmount = cartTotal * taxRate;
  const finalTotal = cartTotal + deliveryFee + taxAmount;

  // Generate available time slots
  const availableTimeSlots = useMemo(() => {
    const slots = [];
    const startHour = 11;
    const endHour = 21;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minutes of ['00', '15', '30', '45']) {
        if (hour === endHour && minutes !== '00') continue;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        slots.push({
          value: `${hour.toString().padStart(2, '0')}:${minutes}`,
          label: `${displayHour}:${minutes} ${period}`
        });
      }
    }
    return slots;
  }, []);

  const minDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  const maxDate = useMemo(() => {
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    return twoWeeks.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    loadTaxExemptStatus();
  }, [user]);

  const loadTaxExemptStatus = async () => {
    if (user?.id) {
      try {
        const status = await taxExemptionService.getTaxExemption(user.id);
        setTaxExemptStatus(status);
      } catch (error) {
        console.error('Error loading tax exempt status:', error);
      }
    }
  };

  const handleOrderTypeChange = (type) => {
    setSelectedOrderType(type);
    setOrderType(type === 'catering' ? 'catering' : 'regular');
    setIsCateringOrder(type === 'catering');
    
    if (type === 'catering') {
      setOrderTiming('scheduled');
    }
  };

  const validateCheckout = () => {
    const validationErrors = [];

    if (cartItems.length === 0) {
      validationErrors.push('Your cart is empty');
      return validationErrors;
    }

    if (selectedOrderType === 'pickup') {
      if (orderTiming === 'scheduled') {
        if (!scheduledDate) {
          validationErrors.push('Please select a pickup date');
        }
        if (!scheduledTime) {
          validationErrors.push('Please select a pickup time');
        }
      }
    } else if (selectedOrderType === 'catering') {
      const cateringErrors = validateCateringOrder(cartTotal);
      validationErrors.push(...cateringErrors);
    }

    return validationErrors;
  };

  const proceedToPayment = async () => {
    const validationErrors = validateCheckout();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the errors before proceeding');
      return;
    }

    setLoading(true);
    try {
      const orderMetadata = {
        order_type: selectedOrderType,
        customer_id: user?.id,
        customer_email: user?.email,
        tax_exempt: (taxExemptStatus?.verified && applyTaxExempt) || false,
        tax_exempt_number: taxExemptStatus?.licenseNumber || '',
      };

      if (selectedOrderType === 'pickup') {
        if (orderTiming === 'asap') {
          orderMetadata.pickup_time = 'ASAP';
          orderMetadata.estimated_ready = '20-30 minutes';
        } else {
          orderMetadata.pickup_time = `${scheduledDate}T${scheduledTime}`;
        }
      } else if (selectedOrderType === 'catering') {
        orderMetadata.catering_details = JSON.stringify({
          delivery_date: cateringDetails.deliveryDate,
          delivery_time: cateringDetails.deliveryTime,
          delivery_address: cateringDetails.deliveryAddress,
          number_of_guests: cateringDetails.numberOfGuests,
          need_setup: cateringDetails.needSetup,
          need_utensils: cateringDetails.needUtensils,
          special_instructions: cateringDetails.specialInstructions,
        });
      }
      
      const sessionData = await stripeService.createCheckoutSession(
        cartItems, 
        orderMetadata
      );
      
      await stripeService.redirectToCheckout(sessionData);

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
      setLoading(false);
    }
  };

  const estimatedPrepTime = useMemo(() => {
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (itemCount <= 3) return '15-20';
    if (itemCount <= 6) return '20-30';
    return '30-45';
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            Checkout
          </h1>
          <p className="text-white/40 font-medium">
            Complete your order
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
                <Store className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                Order Type
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOrderTypeChange('pickup')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedOrderType === 'pickup'
                      ? 'border-white bg-white/10'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${
                      selectedOrderType === 'pickup' 
                        ? 'bg-white/20' 
                        : 'bg-white/5'
                    }`}>
                      <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <span className={`font-semibold ${
                      selectedOrderType === 'pickup' ? 'text-white' : 'text-white/60'
                    }`}>
                      Pickup
                    </span>
                  </div>
                  <p className="text-xs text-white/40 font-medium">
                    Pick up at restaurant
                  </p>
                </button>

                <button
                  onClick={() => handleOrderTypeChange('catering')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedOrderType === 'catering'
                      ? 'border-white bg-white/10'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-xl ${
                      selectedOrderType === 'catering' 
                        ? 'bg-white/20' 
                        : 'bg-white/5'
                    }`}>
                      <Utensils className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <span className={`font-semibold ${
                      selectedOrderType === 'catering' ? 'text-white' : 'text-white/60'
                    }`}>
                      Catering
                    </span>
                  </div>
                  <p className="text-xs text-white/40 font-medium">
                    $250 min • $20 delivery
                  </p>
                </button>
              </div>
            </motion.div>

            {/* Pickup Timing */}
            {selectedOrderType === 'pickup' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
              >
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
                  <Clock className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                  Pickup Time
                </h2>

                {/* ASAP vs Scheduled */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setOrderTiming('asap')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      orderTiming === 'asap'
                        ? 'border-white bg-white/10'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Zap className="w-4 h-4" strokeWidth={1.5} />
                      <span className={`font-semibold text-sm ${
                        orderTiming === 'asap' ? 'text-white' : 'text-white/60'
                      }`}>
                        ASAP
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mt-1 text-center font-medium">
                      {estimatedPrepTime} min
                    </p>
                  </button>

                  <button
                    onClick={() => setOrderTiming('scheduled')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      orderTiming === 'scheduled'
                        ? 'border-white bg-white/10'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 justify-center">
                      <Calendar className="w-4 h-4" strokeWidth={1.5} />
                      <span className={`font-semibold text-sm ${
                        orderTiming === 'scheduled' ? 'text-white' : 'text-white/60'
                      }`}>
                        Schedule
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mt-1 text-center font-medium">
                      Choose time
                    </p>
                  </button>
                </div>

                {/* Scheduled Time Selection */}
                <AnimatePresence>
                  {orderTiming === 'scheduled' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid sm:grid-cols-2 gap-3"
                    >
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={minDate}
                          max={maxDate}
                          className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/60 mb-2">
                          Time
                        </label>
                        <select
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium text-sm"
                        >
                          <option value="" className="bg-black">Select time</option>
                          {availableTimeSlots.map((slot) => (
                            <option key={slot.value} value={slot.value} className="bg-black">
                              {slot.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Catering Form */}
            <AnimatePresence>
              {selectedOrderType === 'catering' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.15 }}
                >
                  <CateringOrderForm />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Messages */}
            <AnimatePresence>
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
                >
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-semibold text-red-300 mb-2">
                        Please fix the following:
                      </p>
                      <ul className="space-y-1">
                        {errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-300/80 flex items-center gap-2 font-medium">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 sticky top-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
                <ShoppingBag className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-xs font-semibold text-white/40 bg-white/5 px-2 py-1 rounded-lg flex-shrink-0">
                        {item.quantity}×
                      </span>
                      <div className="min-w-0">
                        <span className="text-sm text-white/80 block truncate font-medium">{item.name}</span>
                        {item.modifiers && Object.keys(item.modifiers).length > 0 && (
                          <span className="text-xs text-white/40 block font-medium">
                            {Object.values(item.modifiers)
                              .map(mod => mod.name || (Array.isArray(mod) ? mod.map(m => m.name).join(', ') : ''))
                              .filter(Boolean)
                              .join(' • ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-white whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-medium">Subtotal</span>
                  <span className="text-white font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60 font-medium">Delivery Fee</span>
                    <span className="text-white font-semibold">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-medium">
                    Tax {(taxExemptStatus?.verified && applyTaxExempt) && (
                      <span className="text-green-400">(Exempt)</span>
                    )}
                  </span>
                  <span className="text-white font-semibold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-3 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Tax Exempt Toggle */}
              {taxExemptStatus?.verified ? (
                <label className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl cursor-pointer hover:bg-green-500/15 transition-all mb-4">
                  <input
                    type="checkbox"
                    checked={applyTaxExempt}
                    onChange={(e) => setApplyTaxExempt(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-green-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-300">
                      <Check className="w-4 h-4" strokeWidth={2} />
                      <span>Apply tax exemption</span>
                    </div>
                    <p className="text-xs text-green-400/80 mt-1 font-medium">
                      License: {taxExemptStatus.licenseNumber}
                    </p>
                  </div>
                </label>
              ) : (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl opacity-60 mb-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      disabled
                      className="mt-0.5 w-4 h-4 cursor-not-allowed"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-white/40 font-medium">Tax Exemption</p>
                      <p className="text-xs text-white/30 mt-1 font-medium">
                        Please update in My Account to use
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={proceedToPayment}
                  disabled={loading || cartItems.length === 0}
                  className="w-full px-6 py-4 backdrop-blur-xl bg-white hover:bg-white/90 text-black rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" strokeWidth={2} />
                      Pay ${finalTotal.toFixed(2)}
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/shop')}
                  className="w-full px-6 py-3 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-semibold text-sm"
                >
                  ← Back to Menu
                </button>
              </div>

              {/* Trust Signals */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-4 text-xs text-white/30">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                    <span className="font-medium">Secure checkout</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}