import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Utensils, Users, Clock, Calendar, Truck, Package, Check, AlertCircle } from 'lucide-react';
import { useCatering } from '../../contexts/CateringContext';

export default function CateringOrderForm() {
  const { cateringDetails, updateCateringDetails } = useCatering();
  
  // Local state for form
  const [deliveryMethod, setDeliveryMethod] = useState('pickup'); // 'pickup' or 'delivery'
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [needSetup, setNeedSetup] = useState(false);
  const [needUtensils, setNeedUtensils] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Delivery address fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('CO');
  const [zipCode, setZipCode] = useState('');

  // Get minimum date (today + 4 hours for catering)
  const getMinDate = () => {
    const date = new Date();
    date.setHours(date.getHours() + 4);
    return date.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days out
    return date.toISOString().split('T')[0];
  };

  // Time slots for catering (more flexible than regular pickup)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00'
  ];

  const formatTimeForDisplay = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Update context when form changes
  useEffect(() => {
    const details = {
      deliveryMethod,
      deliveryDate,
      deliveryTime,
      numberOfGuests: parseInt(numberOfGuests) || 0,
      needSetup,
      needUtensils,
      specialInstructions,
      deliveryAddress: deliveryMethod === 'delivery' ? {
        address,
        city,
        state,
        zipCode
      } : null
    };
    
    updateCateringDetails(details);
  }, [
    deliveryMethod, deliveryDate, deliveryTime, numberOfGuests, 
    needSetup, needUtensils, specialInstructions,
    address, city, state, zipCode
  ]);

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
      <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 tracking-tight">
        <Utensils className="w-5 h-5 text-white/60" strokeWidth={1.5} />
        Catering Details
      </h2>

      <div className="space-y-6">
        {/* Pickup vs Delivery Toggle */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">
            Fulfillment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDeliveryMethod('pickup')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                deliveryMethod === 'pickup'
                  ? 'border-white bg-white/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${
                  deliveryMethod === 'pickup' ? 'bg-white/20' : 'bg-white/5'
                }`}>
                  <Package className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <span className={`font-semibold ${
                  deliveryMethod === 'pickup' ? 'text-white' : 'text-white/60'
                }`}>
                  Pickup
                </span>
              </div>
              <p className="text-xs text-white/40 font-medium">
                Pick up at restaurant
              </p>
            </button>

            <button
              type="button"
              onClick={() => setDeliveryMethod('delivery')}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                deliveryMethod === 'delivery'
                  ? 'border-white bg-white/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${
                  deliveryMethod === 'delivery' ? 'bg-white/20' : 'bg-white/5'
                }`}>
                  <Truck className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <span className={`font-semibold ${
                  deliveryMethod === 'delivery' ? 'text-white' : 'text-white/60'
                }`}>
                  Delivery
                </span>
              </div>
              <p className="text-xs text-white/40 font-medium">
                $20 delivery fee • 25 mile radius
              </p>
            </button>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" strokeWidth={1.5} />
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full pl-10 pr-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                required
              />
            </div>
            <p className="text-xs text-white/30 mt-1 font-medium">
              Minimum 4 hours advance notice
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">
              Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" strokeWidth={1.5} />
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium appearance-none"
                required
              >
                <option value="" className="bg-black">Select time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time} className="bg-black">
                    {formatTimeForDisplay(time)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Delivery Address (only shown for delivery) */}
        <AnimatePresence>
          {deliveryMethod === 'delivery' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                  required={deliveryMethod === 'delivery'}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                    required={deliveryMethod === 'delivery'}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    maxLength="2"
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium uppercase"
                    required={deliveryMethod === 'delivery'}
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP Code"
                  maxLength="5"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                  required={deliveryMethod === 'delivery'}
                />
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-300 font-medium">
                  Delivery available within 25 miles of Lafayette, CO
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Number of Guests */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4" strokeWidth={1.5} />
            Number of Guests
          </label>
          <input
            type="number"
            value={numberOfGuests}
            onChange={(e) => setNumberOfGuests(e.target.value)}
            min="1"
            placeholder="e.g., 50"
            className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
            required
          />
          <p className="text-xs text-white/30 mt-1 font-medium">
            Helps us prepare the right amount
          </p>
        </div>

        {/* Setup and Utensils Options */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
            <input
              type="checkbox"
              checked={needSetup}
              onChange={(e) => setNeedSetup(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-white"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">
                Need setup assistance
              </div>
              <p className="text-xs text-white/40 mt-0.5 font-medium">
                We'll help set up buffet, chafing dishes, etc.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all">
            <input
              type="checkbox"
              checked={needUtensils}
              onChange={(e) => setNeedUtensils(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-white"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">
                Include utensils & serving supplies
              </div>
              <p className="text-xs text-white/40 mt-0.5 font-medium">
                Plates, napkins, serving spoons, etc.
              </p>
            </div>
          </label>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">
            Special Instructions
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows="3"
            placeholder="Any dietary restrictions, preferences, or special requests..."
            className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium resize-none"
          />
        </div>

        {/* Info Alert */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm text-amber-300 font-semibold mb-1">
                Catering Order Requirements
              </p>
              <ul className="text-xs text-amber-300/80 space-y-1 font-medium">
                <li>• Minimum order: $250</li>
                <li>• Advance notice: 4 hours minimum</li>
                <li>• Delivery fee: $20 (within 25 miles)</li>
                <li>• We'll call to confirm your order details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}