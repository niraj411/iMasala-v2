// src/services/stripeService.js
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Use your Stripe publishable key
const stripePromise = loadStripe('pk_test_51SUZUaDlQAsWuKRF2uiFmcK7cP5bYBFV28mJV2FjbzcIE73aAgwEhmhWARdP0aWx0oaoyKsI58cNrEkVczDgs8vE00SN6hvmWi');

// Helper function to format modifiers for display
const formatModifiersForDisplay = (modifiers) => {
  if (!modifiers || Object.keys(modifiers).length === 0) return '';
  
  const parts = [];
  for (const [key, value] of Object.entries(modifiers)) {
    if (value) {
      // Handle single selection
      if (value.name) {
        parts.push(value.name);
      }
      // Handle multiple selections (array)
      else if (Array.isArray(value)) {
        const names = value.map(v => v.name).filter(Boolean);
        if (names.length) parts.push(names.join(', '));
      }
    }
  }
  
  return parts.join(' • ');
};

export const stripeService = {
  async createCheckoutSession(cartItems, orderMetadata, tipAmount = 0) {
    try {
      const response = await axios.post(
        'https://tandoorikitchenco.com/wp-json/imasala/v1/create-checkout',
        {
          items: cartItems.map(item => {
            const modifierString = formatModifiersForDisplay(item.modifiers);
            
            return {
              name: item.name,
              price: parseFloat(item.price),
              quantity: item.quantity,
              image: item.image,
              // Include modifiers as formatted string for line item description
              description: modifierString || undefined,
              // Include raw modifiers for order meta
              modifiers: item.modifiers || {},
              // Include modifier breakdown for order details
              modifier_details: item.modifiers ? Object.entries(item.modifiers).map(([key, value]) => ({
                group: key,
                selection: value?.name || (Array.isArray(value) ? value.map(v => v.name).join(', ') : ''),
                price: value?.price || 0
              })) : []
            };
          }),
          metadata: orderMetadata,
          tip_amount: tipAmount,
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