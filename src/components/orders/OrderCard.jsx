import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Truck, Package, User, Phone, DollarSign, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { 
    icon: Clock, 
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', 
    label: 'Pending',
    dot: 'bg-amber-400'
  },
  processing: { 
    icon: Package, 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', 
    label: 'Processing',
    dot: 'bg-blue-400'
  },
  'on-hold': { 
    icon: Clock, 
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', 
    label: 'On Hold',
    dot: 'bg-orange-400'
  },
  completed: { 
    icon: CheckCircle, 
    color: 'bg-green-500/10 text-green-400 border-green-500/20', 
    label: 'Completed',
    dot: 'bg-green-400'
  },
  shipped: { 
    icon: Truck, 
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', 
    label: 'Shipped',
    dot: 'bg-purple-400'
  },
  delivered: { 
    icon: CheckCircle, 
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', 
    label: 'Delivered',
    dot: 'bg-gray-400'
  }
};

const OrderCard = ({ order, onStatusUpdate, editable = false }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusInfo = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  const nextStatus = order.status === 'processing' ? 'completed' : 
                   order.status === 'pending' ? 'processing' : null;

  const handlers = useSwipeable({
    onSwiping: (event) => {
      if (editable && nextStatus && event.deltaX > 0) {
        setSwipeOffset(Math.min(event.deltaX, 120));
      }
    },
    onSwiped: async (event) => {
      if (editable && nextStatus && event.deltaX > 60 && !isUpdating) {
        await handleStatusUpdate(nextStatus);
      }
      setSwipeOffset(0);
    },
    trackMouse: true
  });

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    const result = await onStatusUpdate(order.id, newStatus);
    
    if (result.success) {
      toast.success(`Order marked as ${newStatus}`);
    } else {
      toast.error('Failed to update order');
    }
    setIsUpdating(false);
  };

  return (
    <motion.div
      {...handlers}
      className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative group"
      style={{ transform: `translateX(${swipeOffset}px)` }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.15)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Order Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white tracking-tight">Order #{order.id}</h3>
              <ChevronRight className="w-4 h-4 text-white/30" strokeWidth={2} />
            </div>
            <p className="text-sm text-white/40 font-medium">
              {new Date(order.date_created).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })} • {new Date(order.date_created).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${statusInfo.color} backdrop-blur-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} animate-pulse`}></span>
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <User className="w-4 h-4 text-white/60" strokeWidth={1.5} />
            </div>
            <span className="font-medium text-white/90">
              {order.billing.first_name} {order.billing.last_name}
            </span>
          </div>
          {order.billing.phone && (
            <div className="flex items-center gap-3 pl-11">
              <Phone className="w-3.5 h-3.5 text-white/40" strokeWidth={1.5} />
              <span className="text-sm text-white/60 font-medium">{order.billing.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="px-5 py-4 border-b border-white/5">
        <h4 className="font-semibold text-white/70 mb-3 text-sm uppercase tracking-wider">Items</h4>
        <div className="space-y-2.5">
          {order.line_items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex justify-between items-center group/item">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-semibold text-white/40 bg-white/5 rounded-lg px-2 py-1 min-w-[2rem] text-center">
                  {item.quantity}×
                </span>
                <span className="text-sm text-white/80 font-medium truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-sm text-white font-semibold ml-4">
                ${item.total}
              </span>
            </div>
          ))}
          {order.line_items.length > 3 && (
            <div className="text-xs text-white/40 italic pl-11 pt-1">
              +{order.line_items.length - 3} more items
            </div>
          )}
        </div>
      </div>

      {/* Order Total */}
      <div className="px-5 py-4 bg-white/[0.02]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white/60" strokeWidth={2} />
            </div>
            <span className="font-semibold text-white/70 text-sm uppercase tracking-wider">Total</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tracking-tight">
            ${order.total}
          </span>
        </div>
      </div>

      {/* Swipe Indicator */}
      {editable && nextStatus && (
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-green-500 to-emerald-500 flex items-center justify-center transform translate-x-full">
          <div className="text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1 text-white" strokeWidth={2} />
            <span className="text-xs font-semibold text-white/90">Mark {nextStatus}</span>
          </div>
        </div>
      )}

      {/* Updating Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 backdrop-blur-xl bg-black/80 flex items-center justify-center rounded-2xl">
          <div className="text-white text-center">
            <div className="w-10 h-10 mx-auto mb-3">
              <div className="w-full h-full border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
            <span className="text-sm font-medium text-white/80">Updating...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrderCard;