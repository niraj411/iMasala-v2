import React, { createContext, useState, useContext, useEffect } from 'react';
import { woocommerceService } from '../services/woocommerceService';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch categories first
        const categoriesData = await woocommerceService.getCategories();
        // Ensure it's an array
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]);
        // Continue even if categories fail
      }

      try {
        // Fetch products (with variations if available)
        const productsData = await woocommerceService.getProductsWithVariations();

        // Ensure it's an array before processing
        if (!Array.isArray(productsData)) {
          console.error('Products data is not an array:', productsData);
          setProducts([]);
          setError('Failed to load menu. Please try again.');
          return;
        }

        // Map WooCommerce tags to boolean flags for filtering
        const processedProducts = productsData.map(product => ({
          ...product,
          isVegetarian: product.tags?.some(tag =>
            tag.slug === 'vegetarian' || tag.slug === 'veg' || tag.name?.toLowerCase() === 'vegetarian'
          ) || false,
          isSpicy: product.tags?.some(tag =>
            tag.slug === 'spicy' || tag.slug === 'hot' || tag.name?.toLowerCase() === 'spicy'
          ) || false,
          isPopular: product.tags?.some(tag =>
            tag.slug === 'popular' || tag.slug === 'featured' || tag.slug === 'best-seller' || tag.name?.toLowerCase() === 'popular'
          ) || product.featured || false,
        }));

        setProducts(processedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
        setError('Failed to load menu. Please try again.');
      } finally {
        setLoading(false);
      }
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

  const refetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const [categoriesData, productsData] = await Promise.all([
        woocommerceService.getCategories(),
        woocommerceService.getProductsWithVariations()
      ]);

      // Ensure arrays
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      if (!Array.isArray(productsData)) {
        console.error('Products data is not an array:', productsData);
        setProducts([]);
        setError('Failed to load menu. Please try again.');
        return;
      }

      // Map WooCommerce tags to boolean flags for filtering
      const processedProducts = productsData.map(product => ({
        ...product,
        isVegetarian: product.tags?.some(tag =>
          tag.slug === 'vegetarian' || tag.slug === 'veg' || tag.name?.toLowerCase() === 'vegetarian'
        ) || false,
        isSpicy: product.tags?.some(tag =>
          tag.slug === 'spicy' || tag.slug === 'hot' || tag.name?.toLowerCase() === 'spicy'
        ) || false,
        isPopular: product.tags?.some(tag =>
          tag.slug === 'popular' || tag.slug === 'featured' || tag.slug === 'best-seller' || tag.name?.toLowerCase() === 'popular'
        ) || product.featured || false,
      }));

      setProducts(processedProducts);
    } catch (err) {
      console.error('Error refetching data:', err);
      setProducts([]);
      setError('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuContext.Provider value={{
      categories,
      products,
      loading,
      error,
      cart,
      addToCart,
      getCartItemCount,
      refetch
    }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => useContext(MenuContext);