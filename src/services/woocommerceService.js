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
      timeout: 10000
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
      const response = await this.api.get('/products');
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
          per_page: 100, // Get more orders
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
  
  async getProductsWithVariations() {
    try {
      // First get all products
      const products = await this.getProducts();
      
      // Then fetch variations for variable products
      const productsWithVariations = await Promise.all(
        products.map(async (product) => {
          if (product.type === 'variable') {
            try {
              const variations = await this.getProductVariations(product.id);
              return {
                ...product,
                variations: variations
              };
            } catch (error) {
              console.error(`Error fetching variations for product ${product.id}:`, error);
              return product;
            }
          }
          return product;
        })
      );
      
      return productsWithVariations;
    } catch (error) {
      console.error('Error fetching products with variations:', error);
      throw error;
    }
  }
}

export const woocommerceService = new WooCommerceService();