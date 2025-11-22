import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function SimpleNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  
  const isAdmin = user?.roles?.includes('administrator') || user?.roles?.includes('shop_manager');

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl font-semibold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent tracking-tight">
              iMasala
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActivePath('/admin')
                    ? 'bg-white/10 text-white backdrop-blur-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Admin
              </Link>
            )}
            
            <Link
              to="/shop"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActivePath('/shop')
                  ? 'bg-white/10 text-white backdrop-blur-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Shop
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => window.location.href = '/shop'}
              className="relative p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 ml-2"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-red-500/30 ring-2 ring-black">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            <Link
              to="/my-account"
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                isActivePath('/my-account')
                  ? 'bg-white/10 text-white backdrop-blur-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/10">
              <span className="text-sm text-white/60 font-medium hidden sm:block">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-sm font-medium transition-all duration-200 border border-white/10 hover:border-white/20"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}