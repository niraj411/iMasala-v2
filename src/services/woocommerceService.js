import axios from 'axios';
import { Capacitor } from '@capacitor/core';

const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || 'https://tandoorikitchenco.com';
const API_BASE_URL = `${WORDPRESS_URL}/wp-json/wc/v3`;
const CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET;

// Debug logging for native platforms
const isNative = Capacitor.isNativePlatform();
console.log('WooCommerce Service Init:', {
  isNative,
  platform: Capacitor.getPlatform(),
  apiUrl: API_BASE_URL,
  hasKey: !!CONSUMER_KEY,
  hasSecret: !!CONSUMER_SECRET
});

class WooCommerceService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      auth: {
        username: CONSUMER_KEY,
        password: CONSUMER_SECRET
      },
      timeout: 300000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Add request/response interceptors for debugging
    this.api.interceptors.request.use(
      (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url);

        // Fix: Handle case where API returns JSON as string instead of parsed object
        if (typeof response.data === 'string' && response.data.trim().startsWith('{') ||
            typeof response.data === 'string' && response.data.trim().startsWith('[')) {
          try {
            response.data = JSON.parse(response.data);
            console.log('Parsed string response to JSON');
          } catch (e) {
            console.warn('Failed to parse response as JSON:', e);
          }
        }

        return response;
      },
      (error) => {
        console.error('API Response Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  async syncCartToCheckout(cartItems) {
    const checkoutUrl = `${WORDPRESS_URL}/checkout/`;
    return checkoutUrl;
  }

  async getCategories() {
    try {
      const response = await this.api.get('/products/categories', {
        params: {
          per_page: 100,
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

  // ============================================
  // UPDATED: Fetch ALL products with pagination
  // ============================================
  async getProducts() {
    try {
      let allProducts = [];
      let page = 1;
      let hasMore = true;
      const MAX_PAGES = 10; // Safety limit to prevent infinite loops
      const MAX_PRODUCTS_PER_PAGE = 100;

      console.log('Fetching all products with pagination...');

      while (hasMore && page <= MAX_PAGES) {
        const response = await this.api.get('/products', {
          params: {
            per_page: MAX_PRODUCTS_PER_PAGE,
            page: page,
            status: 'publish',
            stock_status: 'instock'
          }
        });

        let products = response.data;

        // Handle case where response is a JSON string instead of parsed array
        if (typeof products === 'string') {
          try {
            products = JSON.parse(products);
            console.log('Parsed string response to array');
          } catch (e) {
            console.error('Failed to parse products string:', e);
            break;
          }
        }

        // Validate response is an array
        if (!Array.isArray(products)) {
          console.error('API returned non-array response:', typeof products, products);
          break;
        }

        // Safety check: if response claims > 100 items on a single page, something is wrong
        if (products.length > MAX_PRODUCTS_PER_PAGE) {
          console.error('API returned unexpected number of products:', products.length);
          break;
        }

        if (products.length > 0) {
          allProducts = [...allProducts, ...products];
          console.log(`Page ${page}: fetched ${products.length} products (total: ${allProducts.length})`);

          // If we got less than 100, we've reached the last page
          hasMore = products.length === MAX_PRODUCTS_PER_PAGE;
          page++;
        } else {
          hasMore = false;
        }
      }

      if (page > MAX_PAGES) {
        console.warn(`Reached max page limit (${MAX_PAGES}), stopping pagination`);
      }

      console.log(`Total products fetched: ${allProducts.length}`);
      return allProducts;
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
  
  async getAllOrders(params = {}) {
    try {
      const response = await this.api.get('/orders', {
        params: {
          per_page: 10,
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

  async getProductsWithVariations() {
    try {
      // This now uses the paginated getProducts()
      const products = await this.getProducts();
      
      const productsWithVariations = await Promise.all(
        products.map(async (product) => {
          // Ensure images are properly formatted
          const formattedProduct = {
            ...product,
            images: product.images?.map(img => ({
              ...img,
              src: img.src?.replace('http://', 'https://')
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

      if (orderData.order_type === 'catering') {
        order.status = 'on-hold';
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
    const validZipCodes = ['80229', '80233', '80234', '80235', '80303', '80026', '80027'];
    return validZipCodes.includes(address.zipCode);
  }
}

export const woocommerceService = new WooCommerceService();