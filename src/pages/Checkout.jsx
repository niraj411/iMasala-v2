// src/pages/Checkout.jsx (Complete replacement)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Truck, Clock, AlertCircle, ChevronRight, 
  MapPin, Users, Utensils, Package, Store, Check
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCatering } from '../contexts/CateringContext';
import { cartSyncService } from '../services/cartSyncService';
import { taxExemptionService } from '../services/taxExemptionService';
import CateringOrderForm from '../components/catering/CateringOrderForm';
import { woocommerceService } from '../services/woocommerceService';
import { stripeService } from '../services/stripeService'; // Also add this if not already there
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
  
  const [selectedOrderType, setSelectedOrderType] = useState('pickup');
  const [pickupTime, setPickupTime] = useState('');
  const [taxExemptStatus, setTaxExemptStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const cartTotal = getCartTotal();
  const deliveryFee = selectedOrderType === 'catering' ? 20 : 0;
  const taxRate = taxExemptStatus?.verified ? 0 : 0.0825; // 8.25% tax rate
  const taxAmount = cartTotal * taxRate;
  const finalTotal = cartTotal + deliveryFee + taxAmount;

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
  };

  const validateCheckout = () => {
    const validationErrors = [];

    if (cartItems.length === 0) {
      validationErrors.push('Your cart is empty');
      return validationErrors;
    }

    if (selectedOrderType === 'pickup') {
      if (!pickupTime) {
        validationErrors.push('Please select a pickup time');
      }
    } else if (selectedOrderType === 'catering') {
      const cateringErrors = validateCateringOrder(cartTotal);
      validationErrors.push(...cateringErrors);
    }

    return validationErrors;
  };

  // Update src/pages/Checkout.jsx - replace the proceedToPayment function:

// In Checkout.jsx, update the proceedToPayment function:

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
      orderMetadata.pickup_time = pickupTime;
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
  return (
    <div className="min-h-screen bg-masala-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-masala-900 mb-2">Checkout</h1>
          <p className="text-masala-600">Complete your order details</p>
        </motion.div>

        {/* Order Type Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-masala-900 mb-4">Select Order Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleOrderTypeChange('pickup')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOrderType === 'pickup'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-masala-200 hover:border-masala-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Store className={`w-6 h-6 ${
                  selectedOrderType === 'pickup' ? 'text-primary-600' : 'text-masala-400'
                }`} />
                {selectedOrderType === 'pickup' && (
                  <Check className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <h3 className="font-medium text-left mb-1">Pickup</h3>
              <p className="text-sm text-masala-600 text-left">
                Pick up your order at our restaurant
              </p>
            </button>

            <button
              onClick={() => handleOrderTypeChange('catering')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedOrderType === 'catering'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-masala-200 hover:border-masala-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Truck className={`w-6 h-6 ${
                  selectedOrderType === 'catering' ? 'text-primary-600' : 'text-masala-400'
                }`} />
                {selectedOrderType === 'catering' && (
                  <Check className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <h3 className="font-medium text-left mb-1">Catering Delivery</h3>
              <p className="text-sm text-masala-600 text-left">
                $250 minimum • $20 delivery fee • 4hr advance
              </p>
            </button>
          </div>
        </div>

        {/* Conditional Forms based on Order Type */}
        <AnimatePresence mode="wait">
          {selectedOrderType === 'pickup' && (
            <motion.div
              key="pickup-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-sm p-6 mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-masala-900">Pickup Details</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-masala-700 mb-2">
                  Pickup Time
                </label>
                <input
                  type="datetime-local"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="text-sm text-masala-600 mt-2">
                  Pickup Location: 123 Main Street, Your City, State
                </p>
              </div>
            </motion.div>
          )}

          {selectedOrderType === 'catering' && (
            <motion.div
              key="catering-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CateringOrderForm />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-masala-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-masala-900">{item.quantity}x</span>
                  <span className="text-masala-700">{item.name}</span>
                </div>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-masala-600">Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-masala-600">Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-masala-600">
                Tax {taxExemptStatus?.verified && '(Exempt)'}
              </span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary-600">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {taxExemptStatus?.verified && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Check className="w-4 h-4" />
                Tax exemption applied (License: {taxExemptStatus.licenseNumber})
              </div>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-2">Please fix the following:</p>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 border border-masala-200 text-masala-700 rounded-lg hover:bg-masala-50 transition-colors font-medium"
          >
            Back to Menu
          </button>
          <button
            onClick={proceedToPayment}
            disabled={loading || cartItems.length === 0}
            className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                Proceed to Payment
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}