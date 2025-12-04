// src/components/layout/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, User, Menu, X, Home, UtensilsCrossed, 
  Clock, ChevronRight, Plus, Minus, Trash2, ArrowRight,
  Phone, MapPin, Star, Gift, ChevronDown, LogOut, LogIn
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export default function MainLayout({ children }) {
  const { cartItems, getCartTotal, updateQuantity, removeFromCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
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

  // Navigation links - different for logged in vs guest
  const navLinks = [
    { path: '/shop', label: 'Menu', icon: UtensilsCrossed },
    ...(isAuthenticated ? [{ path: '/my-account', label: 'My Orders', icon: Clock }] : []),
    ...(isAdmin ? [{ path: '/admin', label: 'Dashboard', icon: Home }] : []),
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Top Banner - Promotional */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2.5 px-4 text-sm border-b border-white/10">
        <span className="inline-flex items-center gap-2 font-medium">
          <Gift className="w-4 h-4" strokeWidth={2} />
          <span>First order? Use code <strong className="font-bold">WELCOME15</strong> for 15% off!</span>
        </span>
      </div>

      {/* Main Navigation */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'backdrop-blur-xl bg-black/80 border-b border-white/10 shadow-lg' 
            : 'bg-black border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/shop" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                <span className="text-white font-bold text-lg">iM</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-white leading-tight tracking-tight text-lg">iMasala</h1>
                <p className="text-xs text-white/40 font-medium">Authentic Indian Cuisine</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'bg-white/10 text-white backdrop-blur-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* User Menu - Different for logged in vs guest */}
              <div className="hidden md:block relative group">
                {isAuthenticated ? (
                  // Logged in user menu
                  <>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <User className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium max-w-24 truncate">
                        {user?.displayName || user?.email?.split('@')[0] || 'Account'}
                      </span>
                      <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 backdrop-blur-xl bg-black/90 rounded-2xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="p-2">
                        <Link 
                          to="/my-account" 
                          className="block px-3 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                        >
                          My Account
                        </Link>
                        <button 
                          onClick={logout}
                          className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-medium flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" strokeWidth={1.5} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  // Guest - Show Sign In button
                  <Link
                    to="/my-account"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <LogIn className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Sign In</span>
                  </Link>
                )}
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setCartPreviewOpen(!cartPreviewOpen)}
                className="relative flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white hover:bg-white/90 text-black rounded-2xl font-semibold transition-all shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                <span className="hidden sm:inline text-sm">
                  ${cartTotal.toFixed(2)}
                </span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <Menu className="w-6 h-6" strokeWidth={1.5} />
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
                      Your Order
                    </h2>
                    <p className="text-sm text-white/40 font-medium">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCartPreviewOpen(false)}
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
                      onClick={() => setCartPreviewOpen(false)}
                      className="px-6 py-3 backdrop-blur-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl font-semibold transition-all"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-white/15 transition-all"
                      >
                        <div className="flex gap-4">
                          <img
                            src={item.image || '/api/placeholder/64/64'}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm mb-1 tracking-tight">
                              {item.name}
                            </h3>
                            <p className="text-white/90 font-bold text-sm mb-2">
                              ${parseFloat(item.price).toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                className="w-7 h-7 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                              >
                                <Minus className="w-3.5 h-3.5 text-white/80" strokeWidth={2} />
                              </button>
                              <span className="w-8 text-center font-semibold text-white text-xs">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5 text-white/80" strokeWidth={2} />
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
                <div className="border-t border-white/10 p-6 bg-white/[0.02]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60 font-medium">Total</span>
                    <span className="text-2xl font-bold text-white tracking-tight">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCartPreviewOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full backdrop-blur-xl bg-white hover:bg-white/90 text-black py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    Checkout
                    <ArrowRight className="w-5 h-5" strokeWidth={2} />
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
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
            />
            
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-72 bg-black border-r border-white/10 shadow-2xl z-50 md:hidden"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-white text-lg tracking-tight">iMasala</h2>
                    <p className="text-xs text-white/40 font-medium">
                      {isAuthenticated ? (user?.email || 'Welcome back!') : 'Welcome, Guest'}
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              
              <nav className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      location.pathname === link.path
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <link.icon className="w-5 h-5" strokeWidth={1.5} />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/my-account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" strokeWidth={1.5} />
                    Sign In
                  </Link>
                )}
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
            className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-2xl md:hidden z-40"
          >
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 backdrop-blur-xl bg-white hover:bg-white/90 text-black rounded-2xl font-bold transition-all flex items-center justify-between px-6"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" strokeWidth={2} />
                View Order ({itemCount})
              </span>
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <span className="text-white font-bold text-lg">iM</span>
                </div>
                <h3 className="font-bold text-white text-lg tracking-tight">iMasala</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed font-medium">
                Authentic Indian & Himalayan cuisine crafted with traditional recipes and the finest ingredients.
              </p>
              <div className="flex items-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="text-xs text-white/40 ml-2 font-medium">Rated 5.0</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link to="/shop" className="block text-white/40 hover:text-white transition-colors font-medium">
                  Order Online
                </Link>
                <Link to="/my-account" className="block text-white/40 hover:text-white transition-colors font-medium">
                  My Orders
                </Link>
                <a href="https://tandoorikitchenco.com" target="_blank" rel="noopener noreferrer" className="block text-white/40 hover:text-white transition-colors font-medium">
                  About Us
                </a>
                <a href="https://tandoorikitchenco.com/contact" target="_blank" rel="noopener noreferrer" className="block text-white/40 hover:text-white transition-colors font-medium">
                  Contact
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <a href="tel:3036658530" className="flex items-start gap-2 text-white/40 hover:text-white transition-colors group font-medium">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span>(303) 665-8530</span>
                </a>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=199+W+South+Boulder+Rd+Lafayette+CO+80026" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-white/40 hover:text-white transition-colors group font-medium"
                >
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <span>199 W. South Boulder Rd.<br />Lafayette, CO 80026</span>
                </a>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Hours of Operation</h4>
              <div className="text-sm text-white/40 space-y-2 font-medium">
                <div>
                  <p className="text-white font-semibold mb-1">Monday - Thursday</p>
                  <p className="text-xs text-white/30">11:00 AM - 2:30 PM</p>
                  <p className="text-xs text-white/30">4:30 PM - 9:00 PM</p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Friday - Saturday</p>
                  <p className="text-xs text-white/30">11:00 AM - 2:30 PM</p>
                  <p className="text-xs text-white/30">4:30 PM - 9:30 PM</p>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Sunday</p>
                  <p className="text-xs text-white/30">11:00 AM - 2:30 PM</p>
                  <p className="text-xs text-white/30">4:30 PM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/30">
              <p className="font-medium">© {new Date().getFullYear()} iMasala. All rights reserved.</p>
              <div className="flex items-center gap-4 font-medium">
                <a href="https://tandoorikitchenco.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="https://tandoorikitchenco.com/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}