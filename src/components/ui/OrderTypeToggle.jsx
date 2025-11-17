// src/components/ui/OrderTypeToggle.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Store, Truck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function OrderTypeToggle() {
  const { orderType, setOrderType } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 inline-flex">
      <button
        onClick={() => setOrderType('regular')}
        className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
          orderType === 'regular'
            ? 'bg-primary-500 text-white'
            : 'text-masala-600 hover:bg-masala-50'
        }`}
      >
        <Store className="w-4 h-4" />
        <span className="font-medium">Regular Order</span>
      </button>
      <button
        onClick={() => setOrderType('catering')}
        className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
          orderType === 'catering'
            ? 'bg-primary-500 text-white'
            : 'text-masala-600 hover:bg-masala-50'
        }`}
      >
        <Truck className="w-4 h-4" />
        <span className="font-medium">Catering</span>
      </button>
    </div>
  );
}