import React, { useState } from 'react';
import {
  Calendar, Clock, Users, MapPin, Truck, Package,
  UtensilsCrossed, Box, MessageSquare, ChevronDown, ChevronUp,
  Eye, Phone, Mail
} from 'lucide-react';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Helper to format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  // Handle HH:MM format
  if (timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }
  return timeString;
};

export default function CateringOrderCard({ order, onStatusUpdate, onViewDetails }) {
  const [showInstructions, setShowInstructions] = useState(false);

  // Extract catering metadata
  const getMeta = (key) => order.meta_data?.find(m => m.key === key)?.value;

  const deliveryMethod = getMeta('delivery_method') || getMeta('catering_delivery_method') || 'pickup';
  const isDelivery = deliveryMethod === 'delivery';
  const deliveryDate = getMeta('delivery_date') || getMeta('catering_delivery_date');
  const deliveryTime = getMeta('delivery_time') || getMeta('catering_delivery_time');
  const numberOfGuests = getMeta('number_of_guests') || getMeta('catering_guests') || '—';
  const needSetup = getMeta('need_setup') === 'yes' || getMeta('catering_need_setup') === 'yes';
  const needUtensils = getMeta('need_utensils') === 'yes' || getMeta('catering_need_utensils') === 'yes';
  const specialInstructions = getMeta('special_instructions') || getMeta('catering_instructions') || '';

  // Parse delivery address
  let deliveryAddress = null;
  const addressRaw = getMeta('delivery_address') || getMeta('catering_delivery_address');
  if (addressRaw) {
    try {
      deliveryAddress = typeof addressRaw === 'string' ? JSON.parse(addressRaw) : addressRaw;
    } catch {
      deliveryAddress = null;
    }
  }

  // Status colors
  const statusColors = {
    'pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'processing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'on-hold': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'completed': 'bg-green-500/10 text-green-400 border-green-500/20',
    'cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  // Theme based on delivery method
  const themeColor = isDelivery ? 'purple' : 'blue';
  const badgeStyle = isDelivery
    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    : 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  const accentBorder = isDelivery ? 'border-purple-500/30' : 'border-blue-500/30';

  return (
    <div className={`backdrop-blur-xl bg-white/5 rounded-2xl border ${accentBorder} overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white text-lg">#{order.id}</span>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${badgeStyle} flex items-center gap-1`}>
                {isDelivery ? <Truck className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                {isDelivery ? 'DELIVERY' : 'PICKUP'}
              </span>
            </div>
            <p className="text-sm text-white/60">
              {order.billing?.first_name} {order.billing?.last_name}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${statusColors[order.status] || 'bg-gray-500/10'}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Date & Time - Prominent Display */}
      <div className={`p-4 ${isDelivery ? 'bg-purple-500/5' : 'bg-blue-500/5'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isDelivery ? 'bg-purple-500/20' : 'bg-blue-500/20'}`}>
            <Calendar className={`w-6 h-6 ${isDelivery ? 'text-purple-400' : 'text-blue-400'}`} />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{formatDate(deliveryDate)}</p>
            <p className={`text-sm ${isDelivery ? 'text-purple-300' : 'text-blue-300'} flex items-center gap-1`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTime(deliveryTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="p-4 space-y-3">
        {/* Guests */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Users className="w-4 h-4 text-white/60" />
          </div>
          <div>
            <p className="text-sm text-white/40">Guests</p>
            <p className="text-white font-semibold">{numberOfGuests}</p>
          </div>
        </div>

        {/* Delivery Address - Only for delivery */}
        {isDelivery && deliveryAddress && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <MapPin className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/40">Delivery Address</p>
              <p className="text-white text-sm">
                {deliveryAddress.address || deliveryAddress.address_1}
                {deliveryAddress.city && `, ${deliveryAddress.city}`}
                {deliveryAddress.state && `, ${deliveryAddress.state}`}
                {deliveryAddress.zipCode || deliveryAddress.zip}
              </p>
            </div>
          </div>
        )}

        {/* Setup & Utensils */}
        <div className="flex gap-4">
          {needSetup && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <Box className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Setup</span>
            </div>
          )}
          {needUtensils && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
              <UtensilsCrossed className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Utensils</span>
            </div>
          )}
          {!needSetup && !needUtensils && (
            <p className="text-sm text-white/30">No setup or utensils requested</p>
          )}
        </div>

        {/* Special Instructions */}
        {specialInstructions && (
          <div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Special Instructions
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showInstructions && (
              <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-sm text-white/80">{specialInstructions}</p>
              </div>
            )}
          </div>
        )}

        {/* Order Total */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-white/60">Order Total</span>
            <span className="text-xl font-bold text-white">${parseFloat(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Contact & Actions */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02]">
        {/* Customer Contact */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          {order.billing?.phone && (
            <a href={`tel:${order.billing.phone}`} className="flex items-center gap-1 text-white/60 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {order.billing.phone}
            </a>
          )}
          {order.billing?.email && (
            <a href={`mailto:${order.billing.email}`} className="flex items-center gap-1 text-white/60 hover:text-white transition-colors truncate">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{order.billing.email}</span>
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) => onStatusUpdate(order.id, e.target.value)}
            className="flex-1 px-3 py-2 text-sm backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-white/20 transition-all"
          >
            <option value="pending" className="bg-black">Pending</option>
            <option value="processing" className="bg-black">Processing</option>
            <option value="on-hold" className="bg-black">On Hold</option>
            <option value="completed" className="bg-black">Completed</option>
            <option value="cancelled" className="bg-black">Cancelled</option>
          </select>
          <button
            onClick={() => onViewDetails(order)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
