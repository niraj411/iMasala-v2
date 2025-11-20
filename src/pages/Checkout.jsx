// src/pages/Checkout.jsx - Improved Version
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
  const [orderTiming, setOrderTiming] = useState('asap'); // 'asap' or 'scheduled'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  // Other states
  const [taxExemptStatus, setTaxExemptStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Calculate totals
  const cartTotal = getCartTotal();
  const deliveryFee = selectedOrderType === 'catering' ? 20 : 0;
  const taxRate = taxExemptStatus?.verified ? 0 : 0.0825;
  const taxAmount = cartTotal * taxRate;
  const finalTotal = cartTotal + deliveryFee + taxAmount;

  // Generate available time slots
  const availableTimeSlots = useMemo(() => {
    const slots = [];
    const startHour = 11; // 11 AM
    const endHour = 21; // 9 PM
    
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

  // Get minimum date (today)
  const minDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Get maximum date (2 weeks out)
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
    
    // Reset timing when switching to catering (catering always needs scheduling)
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
      // Prepare order metadata
      const orderMetadata = {
        order_type: selectedOrderType,
        customer_id: user?.id,
        customer_email: user?.email,
        tax_exempt: taxExemptStatus?.verified || false,
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
      
      // Create Stripe checkout session
      const sessionData = await stripeService.createCheckoutSession(
        cartItems, 
        orderMetadata
      );
      
      // Redirect to Stripe
      await stripeService.redirectToCheckout(sessionData);

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
      setLoading(false);
    }
  };

  // Estimated prep time based on cart
  const estimatedPrepTime = useMemo(() => {
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (itemCount <= 3) return '15-20';
    if (itemCount <= 6) return '20-30';
    return '30-45';
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-masala-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-masala-900 mb-2">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium text-primary-600">Order Details</span>
            </div>
            <div className="flex-1 h-0.5 bg-masala-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-masala-200 text-masala-500 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm text-masala-500">Payment</span>
            </div>
            <div className="flex-1 h-0.5 bg-masala-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-masala-200 text-masala-500 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm text-masala-500">Confirmation</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-masala-100 p-6"
            >
              <h2 className="text-lg font-semibold text-masala-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-500" />
                How would you like your order?
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pickup Option */}
                <button
                  onClick={() => handleOrderTypeChange('pickup')}
                  className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                    selectedOrderType === 'pickup'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-masala-200 hover:border-masala-300 hover:shadow-sm'
                  }`}
                >
                  {selectedOrderType === 'pickup' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <Store className={`w-8 h-8 mb-3 ${
                    selectedOrderType === 'pickup' ? 'text-primary-600' : 'text-masala-400'
                  }`} />
                  <h3 className="font-semibold text-masala-900 mb-1">Pickup</h3>
                  <p className="text-sm text-masala-600">
                    Ready in {estimatedPrepTime} min
                  </p>
                </button>

                {/* Catering Option */}
                <button
                  onClick={() => handleOrderTypeChange('catering')}
                  className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                    selectedOrderType === 'catering'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-masala-200 hover:border-masala-300 hover:shadow-sm'
                  }`}
                >
                  {selectedOrderType === 'catering' && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  <Truck className={`w-8 h-8 mb-3 ${
                    selectedOrderType === 'catering' ? 'text-primary-600' : 'text-masala-400'
                  }`} />
                  <h3 className="font-semibold text-masala-900 mb-1">Catering</h3>
                  <p className="text-sm text-masala-600">
                    $250 min • Delivery included
                  </p>
                </button>
              </div>
            </motion.div>

            {/* Pickup Timing Selection - Only show for pickup orders */}
            <AnimatePresence mode="wait">
              {selectedOrderType === 'pickup' && (
                <motion.div
                  key="pickup-timing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-xl shadow-sm border border-masala-100 p-6"
                >
                  <h2 className="text-lg font-semibold text-masala-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" />
                    When do you want it?
                  </h2>

                  {/* ASAP vs Schedule Toggle */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setOrderTiming('asap')}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        orderTiming === 'asap'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-masala-200 hover:border-masala-300'
                      }`}
                    >
                      <Zap className={`w-5 h-5 ${
                        orderTiming === 'asap' ? 'text-primary-600' : 'text-masala-400'
                      }`} />
                      <div className="text-left">
                        <p className="font-medium text-masala-900">ASAP</p>
                        <p className="text-xs text-masala-500">{estimatedPrepTime} min</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setOrderTiming('scheduled')}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        orderTiming === 'scheduled'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-masala-200 hover:border-masala-300'
                      }`}
                    >
                      <Calendar className={`w-5 h-5 ${
                        orderTiming === 'scheduled' ? 'text-primary-600' : 'text-masala-400'
                      }`} />
                      <div className="text-left">
                        <p className="font-medium text-masala-900">Schedule</p>
                        <p className="text-xs text-masala-500">Pick a time</p>
                      </div>
                    </button>
                  </div>

                  {/* Conditional Date/Time Picker */}
                  <AnimatePresence>
                    {orderTiming === 'scheduled' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-masala-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Date Picker */}
                          <div>
                            <label className="block text-sm font-medium text-masala-700 mb-2">
                              Pickup Date
                            </label>
                            <input
                              type="date"
                              value={scheduledDate}
                              onChange={(e) => setScheduledDate(e.target.value)}
                              min={minDate}
                              max={maxDate}
                              className="w-full px-4 py-3 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                          </div>

                          {/* Time Picker */}
                          <div>
                            <label className="block text-sm font-medium text-masala-700 mb-2">
                              Pickup Time
                            </label>
                            <div className="relative">
                              <select
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                                className="w-full px-4 py-3 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white"
                              >
                                <option value="">Select time</option>
                                {availableTimeSlots.map((slot) => (
                                  <option key={slot.value} value={slot.value}>
                                    {slot.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-masala-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pickup Location */}
                  <div className={`flex items-start gap-3 p-3 bg-masala-50 rounded-lg ${orderTiming === 'scheduled' ? 'mt-4' : ''}`}>
                    <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-masala-900 text-sm">Pickup Location</p>
                      <p className="text-sm text-masala-600">
                        Tandoori Kitchen • 123 Main Street, Your City, State
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Catering Form */}
              {selectedOrderType === 'catering' && (
                <motion.div
                  key="catering-form"
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
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-2">
                        Please fix the following:
                      </p>
                      <ul className="space-y-1">
                        {errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-center gap-2">
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
              className="bg-white rounded-xl shadow-sm border border-masala-100 p-6 sticky top-6"
            >
              <h2 className="text-lg font-semibold text-masala-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-500" />
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                        {item.quantity}x
                      </span>
                      <span className="text-sm text-masala-700 truncate">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-masala-900 whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="border-t border-masala-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-masala-600">Subtotal</span>
                  <span className="text-masala-900">${cartTotal.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-masala-600">Delivery Fee</span>
                    <span className="text-masala-900">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-masala-600">
                    Tax {taxExemptStatus?.verified && (
                      <span className="text-green-600">(Exempt)</span>
                    )}
                  </span>
                  <span className="text-masala-900">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-masala-100">
                  <span className="text-masala-900">Total</span>
                  <span className="text-primary-600">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Tax Exempt Badge */}
              {taxExemptStatus?.verified && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <Check className="w-4 h-4" />
                    <span>Tax exempt applied</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    License: {taxExemptStatus.licenseNumber}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={proceedToPayment}
                  disabled={loading || cartItems.length === 0}
                  className="w-full px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ${finalTotal.toFixed(2)}
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/shop')}
                  className="w-full px-6 py-3 border border-masala-200 text-masala-700 rounded-xl hover:bg-masala-50 transition-colors font-medium text-sm"
                >
                  ← Back to Menu
                </button>
              </div>

              {/* Trust Signals */}
              <div className="mt-6 pt-4 border-t border-masala-100">
                <div className="flex items-center justify-center gap-4 text-xs text-masala-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img 
                      src="/stripe-badge.svg" 
                      alt="Powered by Stripe" 
                      className="h-4 opacity-50"
                      onError={(e) => e.target.style.display = 'none'}
                    />
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