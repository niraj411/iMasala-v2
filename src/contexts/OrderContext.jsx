import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { woocommerceService } from '../services/woocommerceService';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();

  // Track the latest order ID for smart refresh
  const latestOrderIdRef = useRef(0);

  const fetchOrders = async (params = {}) => {
    setLoading(true);
    try {
      // For non-admin users, filter by email on the API level
      const queryParams = user?.id === 1
        ? params  // Admin gets all orders
        : { ...params, search: user?.email }; // Others get filtered by email

      const ordersData = await woocommerceService.getAllOrders(queryParams);
      setOrders(ordersData);
      setLastRefresh(new Date());

      // Update latest order ID
      if (ordersData && ordersData.length > 0) {
        const maxId = Math.max(...ordersData.map(o => o.id));
        latestOrderIdRef.current = maxId;
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Smart refresh - only fetches all orders if there are new ones
  const smartRefresh = useCallback(async () => {
    if (isChecking) return { hasNewOrders: false };

    setIsChecking(true);
    try {
      const result = await woocommerceService.checkForNewOrders(latestOrderIdRef.current);

      if (result.hasNewOrders) {
        // New orders found, do a full refresh
        await fetchOrders();
        return { hasNewOrders: true, newOrder: result.latestOrder };
      }

      // No new orders, just update the timestamp
      setLastRefresh(new Date());
      return { hasNewOrders: false };
    } catch (error) {
      console.error('Error in smart refresh:', error);
      return { hasNewOrders: false };
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, user]);

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
      isChecking,
      lastRefresh,
      fetchOrders,
      refreshOrders: fetchOrders, // Alias for backward compatibility
      smartRefresh,
      updateOrderStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);