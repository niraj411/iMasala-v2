import React, { createContext, useState, useContext, useEffect } from 'react';
import { woocommerceService } from '../services/woocommerceService';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await woocommerceService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      // Use the new method that includes variations
      const productsData = await woocommerceService.getProductsWithVariations();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to basic products
      const basicProducts = await woocommerceService.getProducts();
      setProducts(basicProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchCategories(), fetchProducts()]);
    };
    loadData();
  }, []);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <MenuContext.Provider value={{
      categories,
      products,
      loading,
      cart,
      addToCart,
      getCartItemCount
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => useContext(MenuContext);