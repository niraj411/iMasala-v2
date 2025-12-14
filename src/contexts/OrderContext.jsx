import React, { createContext, useState, useContext, useEffect } from 'react';
import { woocommerceService } from '../services/woocommerceService';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchOrders = async (params = {}) => {
    setLoading(true);
    try {
      // For non-admin users, filter by email on the API level
      const queryParams = user?.id === 1 
        ? params  // Admin gets all orders
        : { ...params, search: user?.email }; // Others get filtered by email
      
      const ordersData = await woocommerceService.getAllOrders(queryParams);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = await woocommerceService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      return { success: true };
    } catch (error) {
      console.error('Error updating order:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      fetchOrders,
      refreshOrders: fetchOrders, // Alias for backward compatibility
      updateOrderStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);