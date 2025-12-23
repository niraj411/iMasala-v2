// src/services/stripeService.js
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || 'https://tandoorikitchenco.com';
const isNative = Capacitor.isNativePlatform();

// Stripe mode toggle: 'test' or 'live'
const STRIPE_MODE = import.meta.env.VITE_STRIPE_MODE || 'test';

// Get the appropriate key based on mode
const STRIPE_PUBLISHABLE_KEY = STRIPE_MODE === 'live'
  ? import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY
  : import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY || 'pk_test_51SUZUaDlQAsWuKRF2uiFmcK7cP5bYBFV28mJV2FjbzcIE73aAgwEhmhWARdP0aWx0oaoyKsI58cNrEkVczDgs8vE00SN6hvmWi';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

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
      const requestData = {
        items: cartItems.map(item => {
          const modifierString = formatModifiersForDisplay(item.modifiers);

          return {
            id: item.id,
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
      };

      let responseData;

      if (isNative) {
        // Use CapacitorHttp for native iOS/Android
        const response = await CapacitorHttp.request({
          url: `${WORDPRESS_URL}/wp-json/imasala/v1/create-checkout`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: requestData
        });

        // Parse response data if it's a string
        responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      } else {
        // Use axios for web
        const response = await axios.post(
          `${WORDPRESS_URL}/wp-json/imasala/v1/create-checkout`,
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        responseData = response.data;
      }

      // Validate response
      if (!responseData) {
        throw new Error('No response data from checkout endpoint');
      }

      if (!responseData.url && !responseData.sessionId) {
        throw new Error('Invalid response: missing url and sessionId');
      }

      return responseData;
    } catch (error) {
      throw error;
    }
  },

  async redirectToCheckout(sessionData) {
    if (!sessionData) {
      throw new Error('No session data provided to redirectToCheckout');
    }

    // If URL is provided by backend, use it directly (preferred method)
    if (sessionData.url) {
      window.location.href = sessionData.url;
      return;
    }

    // Fallback to Stripe.js redirect
    if (sessionData.sessionId) {
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionData.sessionId
      });

      if (error) {
        throw error;
      }
      return;
    }

    throw new Error('Session data missing both url and sessionId');
  }
};

export default stripeService;