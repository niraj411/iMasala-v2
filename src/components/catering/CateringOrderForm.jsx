import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Utensils, Users, Clock, Calendar, Truck, Package, 
  Check, AlertCircle, ChevronDown, Sparkles, MessageSquare,
  UtensilsCrossed, Box
} from 'lucide-react';
import { useCatering, CATERING_PRICING } from '../../contexts/CateringContext';
import { getDeliveryZoneInfo, DELIVERY_FEES } from '../../config/delivery';

// Catering hours - more flexible than regular pickup
const CATERING_HOURS = {
  0: { start: '08:00', end: '21:00' }, // Sunday
  1: { start: '08:00', end: '21:00' }, // Monday
  2: { start: '08:00', end: '21:00' }, // Tuesday
  3: { start: '08:00', end: '21:00' }, // Wednesday
  4: { start: '08:00', end: '21:00' }, // Thursday
  5: { start: '08:00', end: '21:30' }, // Friday
  6: { start: '08:00', end: '21:30' }, // Saturday
};

export default function CateringOrderForm() {
  const { cateringDetails, updateCateringDetails } = useCatering();
  
  // Local state for form
  const [deliveryMethod, setDeliveryMethod] = useState(cateringDetails?.deliveryMethod || 'pickup');
  const [deliveryDate, setDeliveryDate] = useState(cateringDetails?.deliveryDate || '');
  const [deliveryTime, setDeliveryTime] = useState(cateringDetails?.deliveryTime || '');
  const [numberOfGuests, setNumberOfGuests] = useState(cateringDetails?.numberOfGuests || '');
  const [needSetup, setNeedSetup] = useState(cateringDetails?.needSetup || false);
  const [needUtensils, setNeedUtensils] = useState(cateringDetails?.needUtensils || false);
  const [specialInstructions, setSpecialInstructions] = useState(cateringDetails?.specialInstructions || '');
  
  // Delivery address fields
  const [address, setAddress] = useState(cateringDetails?.deliveryAddress?.address || '');
  const [city, setCity] = useState(cateringDetails?.deliveryAddress?.city || '');
  const [state, setState] = useState(cateringDetails?.deliveryAddress?.state || 'CO');
  const [zipCode, setZipCode] = useState(cateringDetails?.deliveryAddress?.zipCode || '');

  // Helper functions
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatTimeForDisplay = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Get minimum date (today - allow same day if 4+ hours available)
  const minDate = useMemo(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }, []);

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // 30 days out
    return date.toISOString().split('T')[0];
  }, []);

  // Generate available time slots based on selected date
  const availableTimeSlots = useMemo(() => {
    if (!deliveryDate) return [];

    const selectedDateObj = new Date(deliveryDate + 'T00:00:00');
    const dayOfWeek = selectedDateObj.getDay();
    const hours = CATERING_HOURS[dayOfWeek];
    
    if (!hours) return [];

    const slots = [];
    const now = new Date();
    const isToday = deliveryDate === now.toISOString().split('T')[0];
    const minAdvanceTime = new Date();
    minAdvanceTime.setHours(minAdvanceTime.getHours() + 4); // 4 hour minimum

    const startMinutes = timeToMinutes(hours.start);
    const endMinutes = timeToMinutes(hours.end);
    
    for (let minutes = startMinutes; minutes <= endMinutes; minutes += 30) {
      const timeStr = minutesToTime(minutes);
      
      if (isToday) {
        const slotDateTime = new Date(deliveryDate + 'T' + timeStr);
        if (slotDateTime <= minAdvanceTime) {
          continue;
        }
      }
      
      slots.push({
        value: timeStr,
        label: formatTimeForDisplay(timeStr),
        minutes: minutes
      });
    }

    return slots;
  }, [deliveryDate]);

  // Group time slots by period
  const groupedTimeSlots = useMemo(() => {
    if (availableTimeSlots.length === 0) return { morning: [], lunch: [], afternoon: [], evening: [] };

    return {
      morning: availableTimeSlots.filter(slot => slot.minutes < 11 * 60), // Before 11am
      lunch: availableTimeSlots.filter(slot => slot.minutes >= 11 * 60 && slot.minutes < 14 * 60), // 11am - 2pm
      afternoon: availableTimeSlots.filter(slot => slot.minutes >= 14 * 60 && slot.minutes < 17 * 60), // 2pm - 5pm
      evening: availableTimeSlots.filter(slot => slot.minutes >= 17 * 60), // 5pm+
    };
  }, [availableTimeSlots]);

  // Reset time when date changes
  useEffect(() => {
    setDeliveryTime('');
  }, [deliveryDate]);

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

  const TimeSlotSection = ({ title, slots, icon: Icon }) => {
    if (slots.length === 0) return null;
    
    return (
      <div>
        <h4 className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {title}
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.value}
              type="button"
              onClick={() => setDeliveryTime(slot.value)}
              className={`px-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                deliveryTime === slot.value
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Fulfillment Method */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
          <Truck className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          Fulfillment Method
        </h2>
        
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
              +$20 • within 25 miles
            </p>
          </button>
        </div>
      </div>

      {/* Step 2: Date & Time Selection */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
          <Calendar className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} Date & Time
        </h2>

        {/* Date Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">
            Select Date
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
            required
          />
          <p className="text-xs text-white/30 mt-2 font-medium">
            Minimum 4 hours advance notice required
          </p>
        </div>

        {/* Time Selection */}
        <AnimatePresence>
          {deliveryDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <label className="block text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">
                Select Time
              </label>
              
              {availableTimeSlots.length === 0 ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-sm text-amber-300 font-medium">
                    No available times for this date (4 hour minimum notice required). Please select another day.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <TimeSlotSection title="Morning (8am - 11am)" slots={groupedTimeSlots.morning} />
                  <TimeSlotSection title="Lunch (11am - 2pm)" slots={groupedTimeSlots.lunch} />
                  <TimeSlotSection title="Afternoon (2pm - 5pm)" slots={groupedTimeSlots.afternoon} />
                  <TimeSlotSection title="Evening (5pm - Close)" slots={groupedTimeSlots.evening} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation */}
        <AnimatePresence>
          {deliveryDate && deliveryTime && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
            >
              <div className="flex items-center gap-2 text-green-300 font-semibold">
                <Check className="w-5 h-5" strokeWidth={2} />
                <span>
                  {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} scheduled for {new Date(deliveryDate + 'T00:00:00').toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {formatTimeForDisplay(deliveryTime)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 3: Delivery Address (only if delivery) */}
      <AnimatePresence>
        {deliveryMethod === 'delivery' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
              <MapPin className="w-5 h-5 text-white/60" strokeWidth={1.5} />
              Delivery Address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-3">
                  <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lafayette"
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    placeholder="CO"
                    maxLength="2"
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium uppercase text-center"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="80026"
                    maxLength="5"
                    className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Dynamic zone-based delivery fee indicator */}
              {zipCode.length === 5 ? (
                (() => {
                  const zoneInfo = getDeliveryZoneInfo(zipCode);
                  if (zoneInfo.isValid) {
                    return (
                      <div className={`p-3 rounded-xl ${zoneInfo.zone === 1 ? 'bg-green-500/10 border border-green-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                        <p className={`text-xs font-medium flex items-center gap-2 ${zoneInfo.zone === 1 ? 'text-green-300' : 'text-blue-300'}`}>
                          <Truck className="w-4 h-4" />
                          {zoneInfo.description} - Delivery fee: ${zoneInfo.fee.toFixed(2)}
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-300 font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Sorry, we don't deliver to this zip code. Please choose pickup instead.
                        </p>
                      </div>
                    );
                  }
                })()
              ) : (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-xs text-white/50 font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Enter zip code to see delivery fee (${DELIVERY_FEES.ZONE_1} local / ${DELIVERY_FEES.ZONE_2} extended)
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 4: Event Details */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
          <Users className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          Event Details
        </h2>

        {/* Number of Guests */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider">
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
          <p className="text-xs text-white/30 mt-2 font-medium">
            Helps us prepare the right portions
          </p>
        </div>

        {/* Setup and Utensils Options */}
        <div className="space-y-3">
          <label className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={needSetup}
                onChange={(e) => setNeedSetup(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                needSetup 
                  ? 'bg-white border-white' 
                  : 'border-white/30 group-hover:border-white/50'
              }`}>
                {needSetup && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-white/60" />
                <span className="text-sm font-semibold text-white">Setup Assistance</span>
              </div>
              <p className="text-xs text-white/40 mt-1 font-medium">
                We'll help set up buffet stations, chafing dishes, and serving areas
              </p>
            </div>
          </label>

          <label className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-all group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={needUtensils}
                onChange={(e) => setNeedUtensils(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                needUtensils
                  ? 'bg-white border-white'
                  : 'border-white/30 group-hover:border-white/50'
              }`}>
                {needUtensils && <Check className="w-4 h-4 text-black" strokeWidth={3} />}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-semibold text-white">Serving Supplies</span>
                </div>
                <span className="text-xs text-white/40 font-medium">
                  ${CATERING_PRICING.UTENSIL_PRICE.toFixed(2)}/guest
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1 font-medium">
                Includes plates, napkins, utensils, and serving spoons
              </p>
              {needUtensils && numberOfGuests > 0 && (
                <p className="text-xs text-green-400 mt-2 font-semibold">
                  {numberOfGuests} guests × ${CATERING_PRICING.UTENSIL_PRICE.toFixed(2)} = ${(numberOfGuests * CATERING_PRICING.UTENSIL_PRICE).toFixed(2)}
                </p>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Step 5: Special Instructions */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
          <MessageSquare className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          Special Instructions
        </h2>
        
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          rows="3"
          placeholder="Dietary restrictions, allergies, preferences, parking instructions, or any special requests..."
          className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium resize-none"
        />
      </div>

      {/* Info Alert */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
        <div className="flex gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-sm text-amber-300 font-semibold mb-2">
              Catering Order Info
            </p>
            <ul className="text-xs text-amber-300/80 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                Minimum order: ${CATERING_PRICING.MINIMUM_ORDER.toFixed(0)}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                4 hours advance notice required
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5"></span>
                <span>
                  Delivery fees: ${DELIVERY_FEES.ZONE_1} (local) / ${DELIVERY_FEES.ZONE_2} (extended area)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                Serving supplies: ${CATERING_PRICING.UTENSIL_PRICE.toFixed(2)} per guest
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                We'll call to confirm your order details
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}