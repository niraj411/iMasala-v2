import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Truck, Package, User, Phone, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  processing: { icon: Package, color: 'bg-blue-100 text-blue-800', label: 'Processing' },
  'on-hold': { icon: Clock, color: 'bg-orange-100 text-orange-800', label: 'On Hold' },
  completed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Completed' },
  shipped: { icon: Truck, color: 'bg-purple-100 text-purple-800', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-gray-100 text-gray-800', label: 'Delivered' }
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
      className="bg-white rounded-lg shadow-sm border border-masala-200 overflow-hidden relative"
      style={{ transform: `translateX(${swipeOffset}px)` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Order Header */}
      <div className="bg-masala-50 px-4 py-3 border-b border-masala-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-masala-900">Order #{order.id}</h3>
            <p className="text-sm text-masala-600">
              {new Date(order.date_created).toLocaleDateString()} at{' '}
              {new Date(order.date_created).toLocaleTimeString()}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusInfo.color}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-4 border-b border-masala-100">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-4 h-4 text-masala-500" />
          <span className="font-medium text-masala-900">
            {order.billing.first_name} {order.billing.last_name}
          </span>
        </div>
        {order.billing.phone && (
          <div className="flex items-center gap-3 text-sm text-masala-600">
            <Phone className="w-4 h-4" />
            <span>{order.billing.phone}</span>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="p-4 border-b border-masala-100">
        <h4 className="font-medium text-masala-900 mb-2">Items:</h4>
        <div className="space-y-1">
          {order.line_items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-masala-700">
                {item.quantity}x {item.name}
              </span>
              <span className="text-masala-900 font-medium">
                ${item.total}
              </span>
            </div>
          ))}
          {order.line_items.length > 3 && (
            <div className="text-sm text-masala-500 italic">
              +{order.line_items.length - 3} more items
            </div>
          )}
        </div>
      </div>

      {/* Order Total */}
      <div className="p-4 bg-masala-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-masala-600" />
            <span className="font-semibold text-masala-900">Total:</span>
          </div>
          <span className="text-lg font-bold text-primary-600">${order.total}</span>
        </div>
      </div>

      {/* Swipe Indicator */}
      {editable && nextStatus && (
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-primary-500 text-white flex items-center justify-center transform translate-x-full">
          <div className="text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs font-medium">Swipe to mark as {nextStatus}</span>
          </div>
        </div>
      )}

      {/* Updating Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-primary-500 bg-opacity-90 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <span className="text-sm">Updating...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default OrderCard;