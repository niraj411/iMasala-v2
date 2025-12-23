// src/contexts/CartContext.jsx (Fixed to preserve modifiers)
import React, { createContext, useState, useContext, useEffect } from 'react';
import { storageService } from '../services/storageService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [orderType, setOrderType] = useState('regular'); // 'regular' or 'catering'

  // Load cart from storage on mount (supports iOS native via storageService)
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await storageService.get('imasala_cart');
        const savedOrderType = await storageService.get('imasala_order_type');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        }
        if (savedOrderType) {
          setOrderType(savedOrderType);
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        setCartItems([]);
      } finally {
        setIsInitialized(true);
      }
    };
    loadCart();
  }, []);

  // Save cart to storage whenever it changes (supports iOS native via storageService)
  useEffect(() => {
    if (isInitialized) {
      const saveCart = async () => {
        try {
          await storageService.set('imasala_cart', JSON.stringify(cartItems));
          await storageService.set('imasala_order_type', orderType);
        } catch (error) {
          console.error('Error saving cart to storage:', error);
        }
      };
      saveCart();
    }
  }, [cartItems, orderType, isInitialized]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      // For items with modifiers, we need to check if it's the exact same configuration
      // Items with different modifiers should be separate line items
      const existingIndex = prev.findIndex(item => {
        // Same product ID
        if (item.id !== product.id) return false;
        
        // If either has modifiers, they need to match exactly
        const itemModifiers = JSON.stringify(item.modifiers || {});
        const productModifiers = JSON.stringify(product.modifiers || {});
        
        return itemModifiers === productModifiers;
      });
      
      if (existingIndex !== -1) {
        // Update quantity of existing item with same modifiers
        return prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + (product.quantity || quantity) }
            : item
        );
      }
      
      // Add as new item - preserve ALL properties passed in
      return [...prev, { 
        id: product.id,
        name: product.name,
        price: product.price,
        basePrice: product.basePrice,
        image: product.image || product.images?.[0]?.src,
        quantity: product.quantity || quantity,
        variation_id: product.variation_id,
        attributes: product.attributes,
        // Preserve modifiers!
        modifiers: product.modifiers,
        modifierTotal: product.modifierTotal
      }];
    });
  };

  const removeFromCart = (productId, index) => {
    // If index is provided, remove that specific item (for items with different modifiers)
    if (typeof index === 'number') {
      setCartItems(prev => prev.filter((_, i) => i !== index));
    } else {
      // Legacy behavior - remove first matching product
      setCartItems(prev => prev.filter(item => item.id !== productId));
    }
  };

  const updateQuantity = (productId, quantity, index) => {
    if (quantity === 0) {
      removeFromCart(productId, index);
    } else {
      setCartItems(prev =>
        prev.map((item, i) => {
          // If index provided, use that; otherwise match by ID
          if (typeof index === 'number') {
            return i === index ? { ...item, quantity } : item;
          }
          return item.id === productId ? { ...item, quantity } : item;
        })
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