import axios from 'axios';

const API_BASE_URL = 'https://tandoorikitchenco.com/wp-json/wc/v3';
const CONSUMER_KEY = 'ck_008af43ae701970f3967fb5520937abf49530e2a';
const CONSUMER_SECRET = 'cs_c225cd4adcc19f0df1e245cc08bffea8b1f800bd';

class WooCommerceService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      auth: {
        username: CONSUMER_KEY,
        password: CONSUMER_SECRET
      },
      timeout: 300000
    });
  }

  
  async syncCartToCheckout(cartItems) {
    // This would redirect to WooCommerce checkout with cart items
    // For now, we'll use a simple redirect
    const checkoutUrl = `https://tandoorikitchenco.com/checkout/`;
    return checkoutUrl;
  }
  async getCategories() {
    try {
      const response = await this.api.get('/products/categories', {
        params: {
          per_page: 50,
          hide_empty: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getOrders(params = {}) {
    try {
      const response = await this.api.get('/orders', {
        params: {
          per_page: 50,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.api.put(`/orders/${orderId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrder(orderId) {
    try {
      const response = await this.api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getCoupons() {
    try {
      const response = await this.api.get('/coupons');
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      throw error;
    }
  }

  async getProducts() {
    try {
      const response = await this.api.get('/products', {
        params: {
          per_page: 100,  // Get 100 products per page (max is 100)
          status: 'publish',
          stock_status: 'instock'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
  async getProductVariations(productId) {
    try {
      const response = await this.api.get(`/products/${productId}/variations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product variations:', error);
      throw error;
    }
  }
  async getOrdersStats() {
    try {
      const response = await this.api.get('/reports/orders/totals');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders stats:', error);
      throw error;
    }
  }
  
  async getProductsStats() {
    try {
      const response = await this.api.get('/reports/products/totals');
      return response.data;
    } catch (error) {
      console.error('Error fetching products stats:', error);
      throw error;
    }
  }
  
  async getCustomersStats() {
    try {
      const response = await this.api.get('/reports/customers/totals');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers stats:', error);
      throw error;
    }
  }
  
  // Get orders with more details and pagination
  async getAllOrders(params = {}) {
    try {
      const response = await this.api.get('/orders', {
        params: {
          per_page: 10, // Get more orders
          orderby: 'date',
          order: 'desc',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }
  async getOrdersByEmail(email) {
    try {
      const response = await this.api.get('/orders', {
        params: {
          search: email,
          per_page: 50,
          orderby: 'date',
          order: 'desc'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by email:', error);
      return [];
    }
  }
// src/services/woocommerceService.js - Update getProductsWithVariations:

async getProductsWithVariations() {
  try {
    const products = await this.getProducts();
    
    const productsWithVariations = await Promise.all(
      products.map(async (product) => {
        // Ensure images are properly formatted
        const formattedProduct = {
          ...product,
          images: product.images?.map(img => ({
            ...img,
            src: img.src?.replace('http://', 'https://') // Force HTTPS
          }))
        };
        
        if (product.type === 'variable') {
          try {
            const variations = await this.getProductVariations(product.id);
            return {
              ...formattedProduct,
              variations: variations.map(v => ({
                ...v,
                image: v.image?.src?.replace('http://', 'https://') || formattedProduct.images?.[0]?.src
              }))
            };
          } catch (error) {
            console.error(`Error fetching variations for product ${product.id}:`, error);
            return formattedProduct;
          }
        }
        return formattedProduct;
      })
    );
    
    return productsWithVariations;
  } catch (error) {
    console.error('Error fetching products with variations:', error);
    throw error;
  }
}
  




async createOrderWithMetadata(orderData) {
  try {
    // Prepare the order object with metadata
    const order = {
      payment_method: orderData.payment_method,
      payment_method_title: orderData.payment_method_title,
      set_paid: false,
      billing: orderData.billing,
      shipping: orderData.shipping || orderData.billing,
      line_items: orderData.line_items,
      shipping_lines: orderData.shipping_lines || [],
      meta_data: [
        {
          key: 'order_type',
          value: orderData.order_type
        }
      ]
    };

    // Add catering specific metadata
    if (orderData.order_type === 'catering') {
      order.status = 'on-hold'; // Set status to on-hold for catering
      order.meta_data.push(
        {
          key: 'catering_delivery_date',
          value: orderData.catering_details.delivery_date
        },
        {
          key: 'catering_delivery_time',
          value: orderData.catering_details.delivery_time
        },
        {
          key: 'catering_delivery_address',
          value: JSON.stringify(orderData.catering_details.delivery_address)
        },
        {
          key: 'catering_guests',
          value: orderData.catering_details.number_of_guests
        },
        {
          key: 'catering_need_setup',
          value: orderData.catering_details.need_setup
        },
        {
          key: 'catering_need_utensils',
          value: orderData.catering_details.need_utensils
        },
        {
          key: 'catering_instructions',
          value: orderData.catering_details.special_instructions
        }
      );
    }

    // Add tax exemption metadata
    if (orderData.tax_exempt) {
      order.meta_data.push(
        {
          key: 'tax_exempt',
          value: 'yes'
        },
        {
          key: 'tax_exempt_number',
          value: orderData.tax_exempt_number
        }
      );
      // Set tax to 0 for exempt customers
      order.fee_lines = [{
        name: 'Tax Exemption Applied',
        total: '0',
        tax_status: 'none'
      }];
    }

    const response = await this.api.post('/orders', order);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

async validateDeliveryAddress(address) {
  // This is a placeholder - you'd integrate with Google Maps API
  // For now, just validate ZIP codes within your delivery area
  const validZipCodes = ['80229', '80233', '80234', '80235']; // Example ZIP codes
  return validZipCodes.includes(address.zipCode);
}

}

export const woocommerceService = new WooCommerceService();