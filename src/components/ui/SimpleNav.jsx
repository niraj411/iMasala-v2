import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function SimpleNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();
  
  const isAdmin = user?.roles?.includes('administrator') || user?.roles?.includes('shop_manager');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary-600">🍛 Imasala</span>
          </div>



          {/* Navigation Links */}
          
          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/admin'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Admin Dashboard
              </Link>
            )}
            
            <Link
  to="/shop"
  className={`px-3 py-2 rounded-md text-sm font-medium ${
    location.pathname === '/shop'
      ? 'bg-primary-100 text-primary-700'
      : 'text-gray-600 hover:text-gray-900'
  }`}
>
  Shop
</Link>
<button
  onClick={() => window.location.href = '/shop'}
  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
>
  <ShoppingCart className="w-6 h-6" />
  {cartItemCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {cartItemCount}
    </span>
  )}
</button>
            
            <Link
              to="/my-account"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/my-account'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Account
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                Hello, {user?.name}
              </span>
              <button
                onClick={logout}
                className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}