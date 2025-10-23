import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ExternalLink } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { cartSyncService } from '../../services/cartSyncService';

export default function CartSidebar({ isOpen, onClose }) {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    clearCart 
  } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const proceedToCheckout = async () => {
    if (cartItems.length === 0) return;
    
    try {
      console.log('Starting checkout process with items:', cartItems);
      
      // Use AJAX method for better reliability with variations
      await cartSyncService.addToCartViaAJAXThenCheckout(cartItems);
      
    } catch (error) {
      console.error('Checkout error:', error);
      // Ultimate fallback - redirect to check-out page
      window.location.href = 'https://tandoorikitchenco.com/check-out/';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-masala-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-masala-900">
                  Your Cart ({cartItems.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-masala-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-masala-600" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-masala-300 mx-auto mb-4" />
                  <p className="text-masala-600 mb-4">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 bg-masala-50 rounded-lg"
                    >
                      <img
                        src={item.image || '/api/placeholder/80/80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-masala-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-primary-600 font-semibold">
                          ${parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-white border border-masala-200 flex items-center justify-center hover:bg-masala-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-white border border-masala-200 flex items-center justify-center hover:bg-masala-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-masala-100 p-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={proceedToCheckout}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full border border-masala-200 text-masala-600 hover:bg-masala-50 py-3 rounded-lg font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
                <p className="text-xs text-masala-500 text-center">
                  You'll complete your order on our secure checkout page
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}