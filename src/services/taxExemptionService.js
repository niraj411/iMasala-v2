// src/services/taxExemptionService.js
import axios from 'axios';

const WORDPRESS_API = 'https://tandoorikitchenco.com/wp-json/wp/v2';
const WOOCOMMERCE_API = 'https://tandoorikitchenco.com/wp-json/wc/v3';

export const taxExemptionService = {
  async updateTaxExemption(customerId, exemptionData) {
    const token = localStorage.getItem('wc_token');
    try {
      // Update WooCommerce customer meta
      const response = await axios.put(
        `${WOOCOMMERCE_API}/customers/${customerId}`,
        {
          meta_data: [
            {
              key: 'tax_exempt_number',
              value: exemptionData.licenseNumber
            },
            {
              key: 'tax_exempt_state',
              value: exemptionData.state
            },
            {
              key: 'tax_exempt_expiry',
              value: exemptionData.expiryDate
            },
            {
              key: 'tax_exempt_verified',
              value: exemptionData.verified || false
            }
          ]
        },
        {
          auth: {
            username: import.meta.env.VITE_WC_CONSUMER_KEY,
            password: import.meta.env.VITE_WC_CONSUMER_SECRET
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating tax exemption:', error);
      throw error;
    }
  },

  async getTaxExemption(customerId) {
    try {
      const response = await axios.get(
        `${WOOCOMMERCE_API}/customers/${customerId}`,
        {
          auth: {
            username: import.meta.env.VITE_WC_CONSUMER_KEY,
            password: import.meta.env.VITE_WC_CONSUMER_SECRET
          }
        }
      );
      
      const metaData = response.data.meta_data || [];
      const taxExemptData = {};
      
      metaData.forEach(meta => {
        if (meta.key === 'tax_exempt_number') taxExemptData.licenseNumber = meta.value;
        if (meta.key === 'tax_exempt_state') taxExemptData.state = meta.value;
        if (meta.key === 'tax_exempt_expiry') taxExemptData.expiryDate = meta.value;
        if (meta.key === 'tax_exempt_verified') taxExemptData.verified = meta.value;
      });
      
      return taxExemptData;
    } catch (error) {
      console.error('Error fetching tax exemption:', error);
      return null;
    }
  }
};