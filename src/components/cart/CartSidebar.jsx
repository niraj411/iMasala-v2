import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function CartSidebar({ isOpen, onClose }) {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    clearCart,
    orderType
  } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) return;
    window.location.href = '/checkout';
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-black border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">
                    Your Cart
                  </h2>
                  <p className="text-sm text-white/40 font-medium">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white/60" strokeWidth={1.5} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-white/20" strokeWidth={1.5} />
                  </div>
                  <p className="text-white/60 mb-6 font-medium">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 backdrop-blur-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl font-semibold transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-white/15 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.image || '/api/placeholder/80/80'}
                            alt={item.name}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate mb-1 tracking-tight">
                            {item.name}
                          </h3>
                          <p className="text-white/90 font-bold mb-3">
                            ${parseFloat(item.price).toFixed(2)}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                            >
                              <Minus className="w-4 h-4 text-white/80" strokeWidth={2} />
                            </button>
                            <span className="w-10 text-center font-semibold text-white text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                            >
                              <Plus className="w-4 h-4 text-white/80" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-white/10 p-6 bg-white/[0.02] backdrop-blur-xl space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-white/60 font-medium">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tracking-tight">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                
                {/* Catering Warning */}
                {orderType === 'catering' && getCartTotal() < 250 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-sm text-amber-300 font-medium">
                      <strong className="text-amber-200">Catering Order:</strong> $250 minimum required
                      <br />
                      <span className="text-amber-400/80">Current total: ${getCartTotal().toFixed(2)}</span>
                    </p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={proceedToCheckout}
                    className="w-full backdrop-blur-xl bg-white hover:bg-white/90 text-black py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full border border-white/10 text-white/60 hover:text-white hover:bg-white/5 py-3 rounded-2xl font-semibold transition-all"
                  >
                    Clear Cart
                  </button>
                </div>
                
                {/* Helper Text */}
                <p className="text-xs text-white/30 text-center font-medium">
                  {orderType === 'catering' 
                    ? "You'll configure delivery details at checkout"
                    : "You'll complete your order on our secure checkout page"
                  }
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}