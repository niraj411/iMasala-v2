import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  useEffect(() => {
    // Redirect to shop — cart is managed via the sidebar
    if (cartItems.length > 0) {
      navigate('/checkout', { replace: true });
    } else {
      navigate('/shop', { replace: true });
    }
  }, [navigate, cartItems.length]);

  return null;
}