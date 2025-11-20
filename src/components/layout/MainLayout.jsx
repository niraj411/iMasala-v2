// src/components/layout/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, User, Menu, X, Home, UtensilsCrossed, 
  Clock, ChevronRight, Plus, Minus, Trash2, ArrowRight,
  Phone, MapPin, Star, Gift
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export default function MainLayout({ children }) {
  const { cartItems, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartTotal = getCartTotal();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCartPreviewOpen(false);
  }, [location]);

  const isAdmin = user?.roles?.includes('administrator') || user?.roles?.includes('shop_manager');

  const navLinks = [
    { path: '/shop', label: 'Menu', icon: UtensilsCrossed },
    { path: '/my-account', label: 'My Orders', icon: Clock },
    ...(isAdmin ? [{ path: '/admin', label: 'Dashboard', icon: Home }] : []),
  ];

  return (
    <div className="min-h-screen bg-masala-50">
      {/* Top Banner - Promotional */}
      <div className="bg-primary-600 text-white text-center py-2 px-4 text-sm">
        <span className="inline-flex items-center gap-2">
          <Gift className="w-4 h-4" />
          <span>First order? Use code <strong>WELCOME15</strong> for 15% off!</span>
        </span>
      </div>

      {/* Main Navigation */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md' 
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/shop" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">TK</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-masala-900 leading-tight">Tandoori Kitchen</h1>
                <p className="text-xs text-masala-500">Authentic Indian Cuisine</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-masala-600 hover:bg-masala-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* User Menu */}
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-masala-600 hover:bg-masala-100 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium max-w-24 truncate">
                    {user?.displayName || user?.email?.split('@')[0] || 'Account'}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-masala-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2">
                    <Link 
                      to="/my-account" 
                      className="block px-3 py-2 text-sm text-masala-700 hover:bg-masala-50 rounded-lg"
                    >
                      My Account
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setCartPreviewOpen(!cartPreviewOpen)}
                className="relative flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/25"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">
                  ${cartTotal.toFixed(2)}
                </span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-masala-600 hover:bg-masala-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Preview Sidebar */}
      <AnimatePresence>
        {cartPreviewOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartPreviewOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-masala-900">
                  Your Order ({itemCount})
                </h2>
                <button
                  onClick={() => setCartPreviewOpen(false)}
                  className="p-2 hover:bg-masala-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-masala-500" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-masala-200 mx-auto mb-4" />
                    <p className="text-masala-500 mb-4">Your cart is empty</p>
                    <button
                      onClick={() => {
                        setCartPreviewOpen(false);
                        navigate('/shop');
                      }}
                      className="text-primary-600 font-medium hover:underline"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-3 p-3 bg-masala-50 rounded-xl">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-masala-900 text-sm truncate">
                            {item.name}
                          </h3>
                          <p className="text-primary-600 font-semibold text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-masala-200 rounded-lg hover:bg-masala-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-masala-200 rounded-lg hover:bg-masala-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t p-4 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-masala-600">Subtotal</span>
                    <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCartPreviewOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    Checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCartPreviewOpen(false)}
                    className="w-full py-3 text-masala-600 hover:text-masala-900 text-sm font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-masala-900">Tandoori Kitchen</h2>
                    <p className="text-xs text-masala-500">
                      {user?.email || 'Guest'}
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-masala-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <nav className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      location.pathname === link.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-masala-600 hover:bg-masala-100'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pb-24 md:pb-8">
        {children}
      </main>

      {/* Floating Cart Button (Mobile) */}
      <AnimatePresence>
        {cartItems.length > 0 && location.pathname !== '/checkout' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-2xl md:hidden z-40"
          >
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all flex items-center justify-between px-6"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                View Order ({itemCount})
              </span>
              <span>${cartTotal.toFixed(2)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-masala-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3">Tandoori Kitchen</h3>
              <p className="text-masala-400 text-sm">
                Authentic Indian cuisine made with love and traditional recipes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-masala-400">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (555) 123-4567
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  123 Main Street, Your City
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Hours</h4>
              <div className="text-sm text-masala-400 space-y-1">
                <p>Mon-Thu: 11AM - 9PM</p>
                <p>Fri-Sat: 11AM - 10PM</p>
                <p>Sun: 12PM - 8PM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-masala-800 mt-8 pt-6 text-center text-sm text-masala-500">
            © 2025 Tandoori Kitchen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}