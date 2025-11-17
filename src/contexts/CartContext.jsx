// src/contexts/CartContext.jsx (Updated version)
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [orderType, setOrderType] = useState('regular'); // 'regular' or 'catering'

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('imasala_cart');
      const savedOrderType = localStorage.getItem('imasala_order_type');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      }
      if (savedOrderType) {
        setOrderType(savedOrderType);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCartItems([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('imasala_cart', JSON.stringify(cartItems));
        localStorage.setItem('imasala_order_type', orderType);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, orderType, isInitialized]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { 
        id: product.id,  // Make sure this is the WooCommerce product ID
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.src,
        quantity: quantity,
        variation_id: product.variation_id,
        attributes: product.attributes
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setOrderType('regular');
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const getCartItems = () => {
    return cartItems;
  };

  const toggleOrderType = () => {
    const newType = orderType === 'regular' ? 'catering' : 'regular';
    setOrderType(newType);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      orderType,
      setOrderType,
      toggleOrderType,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartItemCount,
      getCartTotal,
      getCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};