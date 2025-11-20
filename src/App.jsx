// src/App.jsx - Updated with MainLayout
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { MenuProvider } from './contexts/MenuContext';
import { CartProvider } from './contexts/CartContext';
import { CateringProvider } from './contexts/CateringContext'; 
import { Toaster } from 'react-hot-toast';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import OrderSuccess from './pages/OrderSuccess';
import Shop from './pages/Shop';

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';

import './styles/globals.css';

function AppRoutes() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-masala-50">
        <LoadingSpinner />
      </div>
    );
  }

  // Allow access to certain routes without authentication
  const publicPaths = ['/order-success', '/order-cancelled'];
  const currentPath = window.location.pathname;
  
  if (!isAuthenticated && !publicPaths.includes(currentPath)) {
    return <Login />;
  }

  const isAdmin = user?.roles?.includes('administrator') || user?.roles?.includes('shop_manager');

  return (
    <MainLayout>
      <Routes>
        {/* Admin Dashboard */}
        <Route 
          path="/admin" 
          element={
            isAdmin 
              ? <AdminDashboard /> 
              : (
                <div className="min-h-[60vh] flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
                    <p className="text-masala-600 mb-6">
                      You need administrator privileges to access this page.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/my-account'}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium"
                    >
                      Go to My Account
                    </button>
                  </div>
                </div>
              )
          } 
        />
        
        {/* Customer Dashboard */}
        <Route path="/my-account" element={<CustomerDashboard />} />
        
        {/* Shop / Menu */}
        <Route path="/shop" element={<Shop />} />
        
        {/* Checkout */}
        <Route path="/checkout" element={<Checkout />} />
        
        {/* Cart (optional standalone page) */}
        <Route path="/cart" element={<Cart />} />
        
        {/* Order Success */}
        <Route path="/order-success" element={<OrderSuccess />} />
        
        {/* Order Cancelled */}
        <Route 
          path="/order-cancelled" 
          element={
            <div className="min-h-[60vh] flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-masala-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h2 className="text-2xl font-semibold text-masala-900 mb-2">Order Cancelled</h2>
                <p className="text-masala-600 mb-6">
                  Your order was cancelled. Your cart items are still saved.
                </p>
                <button 
                  onClick={() => window.location.href = '/shop'}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Return to Menu
                </button>
              </div>
            </div>
          } 
        />
        
        {/* Order Tracking */}
        <Route path="/order/:orderId" element={<OrderTracking />} />
        
        {/* Default Redirect */}
        <Route 
          path="/" 
          element={
            isAdmin 
              ? <Navigate to="/admin" /> 
              : <Navigate to="/shop" />
          } 
        />
        
        {/* 404 Fallback */}
        <Route 
          path="*" 
          element={
            <div className="min-h-[60vh] flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🍽️</div>
                <h2 className="text-2xl font-semibold text-masala-900 mb-2">Page Not Found</h2>
                <p className="text-masala-600 mb-6">
                  The page you're looking for doesn't exist.
                </p>
                <button 
                  onClick={() => window.location.href = '/shop'}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Go to Menu
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MenuProvider>
          <CartProvider>
            <CateringProvider>
              <OrderProvider>
                <AppRoutes />
                <Toaster 
                  position="bottom-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#1f2937',
                      color: '#fff',
                      borderRadius: '12px',
                      padding: '12px 16px',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </OrderProvider>
            </CateringProvider>
          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;