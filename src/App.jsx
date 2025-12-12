// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { MenuProvider } from './contexts/MenuContext';
import { CartProvider } from './contexts/CartContext';
import { CateringProvider } from './contexts/CateringContext'; 
import { Toaster } from 'react-hot-toast';
import { useNotifications } from './hooks/useNotifications';
import NotificationPermission, { useNotificationPrompt } from './components/NotificationPermission';

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
import Home from './pages/Home';
import Catering from './pages/Catering';

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';

import './styles/globals.css';

function AppRoutes() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  const publicPaths = ['/order-success', '/order-cancelled', '/', '/catering', '/shop', '/cart', '/checkout', '/login'];
  const currentPath = window.location.pathname;
  
  if (!isAuthenticated && !publicPaths.includes(currentPath) && !currentPath.startsWith('/order/')) {
    return (
      <MainLayout>
        <Login />
      </MainLayout>
    );
  }

  const isAdmin = user?.roles?.includes('administrator') || user?.roles?.includes('shop_manager');

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catering" element={<Catering />} />
        <Route 
          path="/admin" 
          element={
            isAdmin 
              ? <AdminDashboard /> 
              : (
                <div className="min-h-[60vh] flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-white/60 mb-6 font-medium">
                      You need administrator privileges to access this page.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/my-account'}
                      className="backdrop-blur-xl bg-white hover:bg-white/90 text-black px-6 py-3 rounded-2xl font-bold transition-all"
                    >
                      Go to My Account
                    </button>
                  </div>
                </div>
              )
          } 
        />
        <Route path="/my-account" element={<CustomerDashboard />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route 
          path="/order-cancelled" 
          element={
            <div className="min-h-[60vh] flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Order Cancelled</h2>
                <p className="text-white/60 mb-6 font-medium">
                  Your order was cancelled. Your cart items are still saved.
                </p>
                <button 
                  onClick={() => window.location.href = '/shop'}
                  className="backdrop-blur-xl bg-white hover:bg-white/90 text-black px-6 py-3 rounded-2xl font-bold transition-all"
                >
                  Return to Menu
                </button>
              </div>
            </div>
          } 
        />
        <Route path="/order/:orderId" element={<OrderTracking />} />
        <Route 
          path="*" 
          element={
            <div className="min-h-[60vh] flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🍽️</div>
                <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Page Not Found</h2>
                <p className="text-white/60 mb-6 font-medium">
                  The page you're looking for doesn't exist.
                </p>
                <button 
                  onClick={() => window.location.href = '/shop'}
                  className="backdrop-blur-xl bg-white hover:bg-white/90 text-black px-6 py-3 rounded-2xl font-bold transition-all"
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

// This component handles notifications and must be inside AuthProvider
function NotificationHandler() {
  useNotifications(); // Initialize foreground message listener
  const { showPrompt, closePrompt } = useNotificationPrompt();
  
  return (
    <NotificationPermission show={showPrompt} onClose={closePrompt} />
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
                <NotificationHandler />
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