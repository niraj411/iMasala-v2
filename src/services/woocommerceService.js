import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';
import { isValidDeliveryZipCode } from '../config/delivery';

const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || 'https://tandoorikitchenco.com';
const API_BASE_URL = `${WORDPRESS_URL}/wp-json/wc/v3`;
const CONSUMER_KEY = import.meta.env.VITE_WC_CONSUMER_KEY;
const CONSUMER_SECRET = import.meta.env.VITE_WC_CONSUMER_SECRET;

// Platform detection at call time (not module load time) for reliable iOS detection
const isNativePlatform = () => Capacitor.isNativePlatform();

// Base64 encode for Basic Auth
const authHeader = 'Basic ' + btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);

class WooCommerceService {
  constructor() {
    // Axios for web platform
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

    // Response interceptor to handle JSON string responses
    this.api.interceptors.response.use(
      (response) => {
        // Fix: Handle case where API returns JSON as string instead of parsed object
        if (typeof response.data === 'string' && response.data.trim().startsWith('{') ||
            typeof response.data === 'string' && response.data.trim().startsWith('[')) {
          try {
            response.data = JSON.parse(response.data);
          } catch (e) {
            // Keep original response if parsing fails
          }
        }
        return response;
      },
      (error) => Promise.reject(error)
    );
  }

  // Native HTTP request helper (bypasses CORS on iOS/Android)
  async nativeRequest(method, endpoint, params = {}, data = null) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // Add query params
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const options = {
      url: url.toString(),
      method: method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.data = data;
    }

    const response = await CapacitorHttp.request(options);

    // Parse JSON string if needed
    let responseData = response.data;
    if (typeof responseData === 'string') {
      try {
        responseData = JSON.parse(responseData);
      } catch (e) {
        // Keep original if parsing fails
      }
    }

    return { data: responseData };
  }

  // Unified request method - uses native HTTP on mobile, axios on web
  async request(method, endpoint, params = {}, data = null) {
    if (isNativePlatform()) {
      return this.nativeRequest(method, endpoint, params, data);
    }

    // Web platform uses axios
    if (method === 'GET') {
      return this.api.get(endpoint, { params });
    } else if (method === 'POST') {
      return this.api.post(endpoint, data);
    } else if (method === 'PUT') {
      return this.api.put(endpoint, data);
    }
  }

  async syncCartToCheckout(cartItems) {
    const checkoutUrl = `${WORDPRESS_URL}/checkout/`;
    return checkoutUrl;
  }

  async getCategories() {
    try {
      const response = await this.request('GET', '/products/categories', {
        per_page: 100,
        hide_empty: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getOrders(params = {}) {
    try {
      const response = await this.request('GET', '/orders', {
        per_page: 50,
        ...params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await this.request('PUT', `/orders/${orderId}`, {}, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrder(orderId) {
    try {
      const response = await this.request('GET', `/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getCoupons() {
    try {
      const response = await this.request('GET', '/coupons');
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
      const MAX_PAGES = 10;
      const MAX_PRODUCTS_PER_PAGE = 100;

      while (hasMore && page <= MAX_PAGES) {
        // Note: Don't filter by stock_status here because variable products
        // have stock managed at the variation level, not parent level.
        // The parent variable product may show as 'outofstock' even when
        // variations are available.
        const response = await this.request('GET', '/products', {
          per_page: MAX_PRODUCTS_PER_PAGE,
          page: page,
          status: 'publish'
        });

        let products = response.data;

        // Handle case where response is a JSON string instead of parsed array
        if (typeof products === 'string') {
          try {
            products = JSON.parse(products);
          } catch (e) {
            break;
          }
        }

        // Validate response is an array
        if (!Array.isArray(products)) {
          break;
        }

        // Safety check: reject unexpected response sizes
        if (products.length > MAX_PRODUCTS_PER_PAGE) {
          break;
        }

        if (products.length > 0) {
          allProducts = [...allProducts, ...products];
          hasMore = products.length === MAX_PRODUCTS_PER_PAGE;
          page++;
        } else {
          hasMore = false;
        }
      }

      return allProducts;
    } catch (error) {
      throw error;
    }
  }

  async getProductVariations(productId) {
    try {
      const response = await this.request('GET', `/products/${productId}/variations`, {
        per_page: 100,
        status: 'publish'
      });
      // Filter to only include in-stock variations
      const variations = response.data;
      return Array.isArray(variations)
        ? variations.filter(v => v.stock_status === 'instock' || !v.manage_stock)
        : variations;
    } catch (error) {
      console.error('Error fetching product variations:', error);
      throw error;
    }
  }

  async getOrdersStats() {
    try {
      const response = await this.request('GET', '/reports/orders/totals');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders stats:', error);
      throw error;
    }
  }

  async getProductsStats() {
    try {
      const response = await this.request('GET', '/reports/products/totals');
      return response.data;
    } catch (error) {
      console.error('Error fetching products stats:', error);
      throw error;
    }
  }

  async getCustomersStats() {
    try {
      const response = await this.request('GET', '/reports/customers/totals');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers stats:', error);
      throw error;
    }
  }

  async getAllOrders(params = {}) {
    try {
      const response = await this.request('GET', '/orders', {
        per_page: 10,
        orderby: 'date',
        order: 'desc',
        ...params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Check for new orders - lightweight call that only fetches the latest order
  async checkForNewOrders(lastKnownOrderId = 0) {
    try {
      const response = await this.request('GET', '/orders', {
        per_page: 1,
        orderby: 'id',
        order: 'desc'
      });
      const orders = response.data;
      if (orders && orders.length > 0) {
        const latestOrderId = orders[0].id;
        return {
          hasNewOrders: latestOrderId > lastKnownOrderId,
          latestOrderId,
          latestOrder: orders[0]
        };
      }
      return { hasNewOrders: false, latestOrderId: lastKnownOrderId };
    } catch (error) {
      console.error('Error checking for new orders:', error);
      return { hasNewOrders: false, latestOrderId: lastKnownOrderId };
    }
  }

  async getOrdersByEmail(email) {
    try {
      const response = await this.request('GET', '/orders', {
        search: email,
        per_page: 50,
        orderby: 'date',
        order: 'desc'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by email:', error);
      return [];
    }
  }

  async getProductsWithVariations() {
    try {
      // Fetch all products (without variations - they'll be fetched on-demand)
      const products = await this.getProducts();

      // Just format products, don't fetch variations upfront for faster loading
      const formattedProducts = products.map(product => ({
        ...product,
        images: product.images?.map(img => ({
          ...img,
          src: img.src?.replace('http://', 'https://')
        })),
        // For variable products, keep empty variations array - will be fetched on-demand
        variations: product.type === 'variable' ? [] : undefined
      }));

      // Filter out simple products that are out of stock
      // Keep all variable products (their stock is managed at variation level)
      return formattedProducts.filter(product => {
        if (product.type === 'variable') {
          // Keep variable products - they have variations managed separately
          return true;
        }
        // For simple products, check stock status
        return product.stock_status === 'instock' || !product.manage_stock;
      });
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

      const response = await this.request('POST', '/orders', {}, order);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async validateDeliveryAddress(address) {
    return isValidDeliveryZipCode(address.zipCode);
  }

  // Fetch all orders for a date range with pagination (for accounting reports)
  // Uses server-side date filtering to minimize data transfer
  async getOrdersForDateRange(startDate, endDate, onProgress = null) {
    try {
      let allOrders = [];
      let page = 1;
      let hasMore = true;
      const PER_PAGE = 100; // WooCommerce max is 100
      const MAX_PAGES = 50; // Safety limit (5000 orders max)

      // Format dates for WooCommerce API (ISO 8601)
      // Add 1 day buffer to 'before' date to ensure we capture all orders on the end date
      // (WooCommerce's 'before' is exclusive, so we need to go past the end date)
      const afterDate = new Date(startDate).toISOString();
      const endDateWithBuffer = new Date(endDate);
      endDateWithBuffer.setDate(endDateWithBuffer.getDate() + 1);
      const beforeDate = endDateWithBuffer.toISOString();

      while (hasMore && page <= MAX_PAGES) {
        const response = await this.request('GET', '/orders', {
          per_page: PER_PAGE,
          page: page,
          after: afterDate,
          before: beforeDate,
          orderby: 'date',
          order: 'desc'
        });

        let orders = response.data;

        // Handle JSON string response
        if (typeof orders === 'string') {
          try {
            orders = JSON.parse(orders);
          } catch (e) {
            break;
          }
        }

        if (!Array.isArray(orders)) {
          break;
        }

        if (orders.length > 0) {
          allOrders = [...allOrders, ...orders];

          // Report progress if callback provided
          if (onProgress) {
            onProgress({
              loaded: allOrders.length,
              page: page,
              isComplete: false
            });
          }

          hasMore = orders.length === PER_PAGE;
          page++;

          // Small delay between requests to avoid overwhelming the server
          if (hasMore) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } else {
          hasMore = false;
        }
      }

      if (onProgress) {
        onProgress({
          loaded: allOrders.length,
          page: page - 1,
          isComplete: true
        });
      }

      return allOrders;
    } catch (error) {
      console.error('Error fetching orders for date range:', error);
      throw error;
    }
  }
}

export const woocommerceService = new WooCommerceService();