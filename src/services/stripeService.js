// src/services/stripeService.js
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Use your Stripe publishable key
const stripePromise = loadStripe('pk_test_51SUZUaDlQAsWuKRF2uiFmcK7cP5bYBFV28mJV2FjbzcIE73aAgwEhmhWARdP0aWx0oaoyKsI58cNrEkVczDgs8vE00SN6hvmWi');

export const stripeService = {
  async createCheckoutSession(cartItems, orderMetadata) {
    try {
        const apiUrl = import.meta.env.DEV 
        ? '/wp-json/imasala/v1/create-checkout'
        : 'https://tandoorikitchenco.com/wp-json/imasala/v1/create-checkout';
      const response = await axios.post(
        'https://tandoorikitchenco.com/wp-json/imasala/v1/create-checkout',
        {
          items: cartItems.map(item => ({
            name: item.name,
            price: parseFloat(item.price),
            quantity: item.quantity,
            image: item.image
          })),
          metadata: orderMetadata,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  async redirectToCheckout(sessionData) {
    // If URL is provided by backend, use it directly
    if (sessionData.url) {
      window.location.href = sessionData.url;
    } else {
      // Fallback to Stripe.js redirect
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ 
        sessionId: sessionData.sessionId 
      });
      
      if (error) {
        console.error('Stripe redirect error:', error);
        throw error;
      }
    }
  }
};