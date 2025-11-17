// src/components/catering/CateringOrderForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Users, Utensils, Package, AlertCircle } from 'lucide-react';
import { useCatering } from '../../contexts/CateringContext';
import { useCart } from '../../contexts/CartContext';

export default function CateringOrderForm() {
  const { 
    cateringDetails, 
    setCateringDetails, 
    getMinimumDeliveryTime,
    validateCateringOrder 
  } = useCatering();
  const { getCartTotal } = useCart();
  const [errors, setErrors] = useState([]);

  const cartTotal = getCartTotal();
  const deliveryFee = 20;
  const totalWithDelivery = cartTotal + deliveryFee;

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCateringDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCateringDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    const validationErrors = validateCateringOrder(cartTotal);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-masala-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Truck className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-masala-900">Catering Delivery Details</h2>
      </div>

      {/* Minimum Order Warning */}
      {cartTotal < 250 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Minimum Order Required</p>
              <p className="text-sm text-yellow-700 mt-1">
                Catering orders require a minimum of $250. Current total: ${cartTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Delivery Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-masala-700 mb-2">
              <Clock className="w-4 h-4" />
              Delivery Date
            </label>
            <input
              type="date"
              value={cateringDetails.deliveryDate}
              onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-masala-700 mb-2">
              <Clock className="w-4 h-4" />
              Delivery Time
            </label>
            <input
              type="time"
              value={cateringDetails.deliveryTime}
              onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
              className="w-full px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-masala-700 mb-2">
            <MapPin className="w-4 h-4" />
            Delivery Address
          </label>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Street Address"
              value={cateringDetails.deliveryAddress.street}
              onChange={(e) => handleInputChange('deliveryAddress.street', e.target.value)}
              className="w-full px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="City"
                value={cateringDetails.deliveryAddress.city}
                onChange={(e) => handleInputChange('deliveryAddress.city', e.target.value)}
                className="px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <input
                type="text"
                placeholder="State"
                value={cateringDetails.deliveryAddress.state}
                onChange={(e) => handleInputChange('deliveryAddress.state', e.target.value)}
                className="px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                maxLength="2"
                required
              />
              <input
                type="text"
                placeholder="ZIP Code"
                value={cateringDetails.deliveryAddress.zipCode}
                onChange={(e) => handleInputChange('deliveryAddress.zipCode', e.target.value)}
                className="px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <textarea
              placeholder="Delivery Instructions (Optional)"
              value={cateringDetails.deliveryAddress.instructions}
              onChange={(e) => handleInputChange('deliveryAddress.instructions', e.target.value)}
              className="w-full px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="2"
            />
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-masala-600" />
            <label className="text-sm font-medium text-masala-700">Number of Guests</label>
            <input
              type="number"
              value={cateringDetails.numberOfGuests}
              onChange={(e) => handleInputChange('numberOfGuests', e.target.value)}
              className="w-24 px-3 py-1 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="1"
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="needSetup"
              checked={cateringDetails.needSetup}
              onChange={(e) => handleInputChange('needSetup', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-masala-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="needSetup" className="flex items-center gap-2 text-sm text-masala-700">
              <Package className="w-4 h-4" />
              Need setup service
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="needUtensils"
              checked={cateringDetails.needUtensils}
              onChange={(e) => handleInputChange('needUtensils', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-masala-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="needUtensils" className="flex items-center gap-2 text-sm text-masala-700">
              <Utensils className="w-4 h-4" />
              Need utensils and plates
            </label>
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="text-sm font-medium text-masala-700 mb-2 block">
            Special Instructions
          </label>
          <textarea
            value={cateringDetails.specialInstructions}
            onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
            className="w-full px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows="3"
            placeholder="Any special requests or dietary requirements..."
          />
        </div>

        {/* Pricing Summary */}
        <div className="bg-masala-50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-masala-600">Subtotal</span>
              <span className="font-medium">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-masala-600">Delivery Fee (25 mile radius)</span>
              <span className="font-medium">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-masala-200">
              <div className="flex justify-between">
                <span className="font-semibold text-masala-900">Total</span>
                <span className="font-bold text-lg text-primary-600">
                  ${totalWithDelivery.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Catering orders will be placed on hold for restaurant confirmation. 
            You will receive an SMS confirmation once your order is approved.
          </p>
        </div>
      </div>
    </motion.div>
  );
}