// src/pages/OrderSuccess.jsx (CREATE THIS NEW FILE)
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState(null);
  
  useEffect(() => {
    // Clear the cart on successful order
    clearCart();
    
    // Get session ID from URL
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // You could fetch order details here if needed
      setOrderNumber(Math.floor(Math.random() * 10000) + 1000); // Temporary order number
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-masala-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-masala-900 mb-2">Order Confirmed!</h1>
        <p className="text-masala-600 mb-4">
          Thank you for your order! We've received your payment and are preparing your food.
        </p>
        {orderNumber && (
          <p className="text-lg font-semibold text-masala-800 mb-4">
            Order Number: #{orderNumber}
          </p>
        )}
        <p className="text-sm text-masala-500 mb-6">
          You'll receive an email confirmation shortly with your order details.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/my-account')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="w-full border border-masala-200 text-masala-600 hover:bg-masala-50 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}