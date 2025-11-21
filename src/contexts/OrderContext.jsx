import React, { createContext, useState, useContext, useEffect } from 'react';
import { woocommerceService } from '../services/woocommerceService';

const OrderContext = createContext();
const fetchOrders = async (params = {}) => {
  setLoading(true);
  try {
    console.log('1. Starting fetch...');
    const ordersData = await woocommerceService.getAllOrders(params);
    console.log('2. Data received:', ordersData);
    console.log('3. Data length:', ordersData?.length);
    setOrders(ordersData);
    console.log('4. Orders set successfully');
  } catch (error) {
    console.error('ERROR in fetchOrders:', error);
  } finally {
    setLoading(false);
    console.log('5. Loading set to false');
  }
};
export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async (params = {}) => {
    setLoading(true);
    try {
      const ordersData = await woocommerceService.getAllOrders(params);
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
    fetchOrders();
  }, []);

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      fetchOrders,
      updateOrderStatus
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);