import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OrderProvider } from './contexts/OrderContext';
import { MenuProvider } from './contexts/MenuContext';
import { CartProvider } from './contexts/CartContext';
import { CateringProvider } from './contexts/CateringContext'; 
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import OrderSuccess from './pages/OrderSuccess';
import SimpleNav from './components/ui/SimpleNav';
import Shop from './pages/Shop';
// Components
import LoadingSpinner from './components/ui/LoadingSpinner';

import './styles/globals.css';

function AppRoutes() {
    const { user, loading, isAuthenticated } = useAuth();
  
    if (loading) {
      return <LoadingSpinner />;
    }
 // Allow access to order-success without authentication
 const publicPaths = ['/order-success', '/order-cancelled'];
 const currentPath = window.location.pathname;
 
 if (!isAuthenticated && !publicPaths.includes(currentPath)) {
   return <Login />;
 }
    // Debug: Check user roles
    console.log('=== USER DEBUG INFO ===');
    console.log('User:', user);
    console.log('User roles:', user?.roles);
    console.log('Is admin?', user?.roles?.includes('administrator') || user?.roles?.includes('shop_manager'));
    console.log('======================');
  
    return (
      <Routes>
        <Route 
          path="/admin" 
          element={
            user?.roles?.includes('administrator') || user?.roles?.includes('shop_manager') 
              ? <AdminDashboard /> 
              : <div className="p-8 text-center">
                  <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
                  <p className="text-gray-600 mb-4">You need administrator privileges to access this page.</p>
                  <p className="text-sm text-gray-500">Your roles: {JSON.stringify(user?.roles)}</p>
                  <button 
                    onClick={() => window.location.href = '/my-account'}
                    className="mt-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
                  >
                    Go to My Account
                  </button>
                </div>
          } 
        />
        <Route 
          path="/my-account" 
          element={<CustomerDashboard />} 
        />
        <Route 
          path="/shop" 
          element={<Shop />} 
        />
          <Route 
          path="/checkout"           
          element={<Checkout />} 
        />
        <Route 
          path="/cart"                
          element={<Cart />} 
        />



        <Route 
          path="/" 
          element={
            user?.roles?.includes('administrator') || user?.roles?.includes('shop_manager') 
              ? <Navigate to="/admin" /> 
              : <Navigate to="/my-account" />
          } 
        />
          <Route 
        path="/order-success" 
        element={<OrderSuccess />} 
      />
      <Route 
        path="/order-cancelled" 
        element={
          <div className="min-h-screen bg-masala-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-masala-900 mb-4">Order Cancelled</h2>
              <p className="text-masala-600 mb-4">Your order was cancelled.</p>
              <button 
                onClick={() => window.location.href = '/shop'}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg"
              >
                Return to Shop
              </button>
            </div>
          </div>
        } 
      />
      </Routes>
    );
  }

function App() {
  return (
    <Router>
      <AuthProvider>
        <MenuProvider>
          <CartProvider>
          <CateringProvider> {/* Add CateringProvider here */}
            <OrderProvider>
            <div className="App">
  <SimpleNav />  {/* ADD THIS LINE! */}
  <AppRoutes />
  <Toaster position="top-right" />
</div>
            </OrderProvider>
            </CateringProvider>
          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;