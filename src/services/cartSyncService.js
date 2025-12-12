const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || 'https://tandoorikitchenco.com';

export const cartSyncService = {
  /**
   * Build proper WooCommerce add-to-cart URLs with attributes
   */
  buildAddToCartURL(cartItems) {
    const baseUrl = `${WORDPRESS_URL}/`;
    const urlParams = new URLSearchParams();
    
    // Clear existing cart first
    urlParams.append('clear-cart', '1');
    
    // Add each item with proper attributes
    cartItems.forEach((item, index) => {
      // Add product ID and quantity
      urlParams.append(`add-to-cart`, item.id);
      urlParams.append(`quantity`, item.quantity);
      
      // Add variation attributes if it's a variable product
      if (item.variation_id && item.attributes) {
        urlParams.append(`variation_id`, item.variation_id);
        Object.entries(item.attributes).forEach(([key, value]) => {
          urlParams.append(`attribute_${key}`, value);
        });
      }
    });
    
    // Add checkout redirect
    urlParams.append('checkout_redirect', '1');
    
    return `${baseUrl}?${urlParams.toString()}`;
  },

  /**
   * Alternative: Add items via WooCommerce AJAX then redirect to check-out
   */
  async addToCartViaAJAXThenCheckout(cartItems) {
    if (cartItems.length === 0) return;
    
    try {
      console.log('Adding items to WooCommerce cart via AJAX...');
      
      // Clear existing cart first
      await fetch(`${WORDPRESS_URL}/?wc-ajax=clear_cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      // Add each item via AJAX
      for (const item of cartItems) {
        const formData = new URLSearchParams();
        formData.append('product_id', item.id);
        formData.append('quantity', item.quantity);
        
        // Add variation data if it's a variable product
        if (item.variation_id) {
          formData.append('variation_id', item.variation_id);
          if (item.attributes) {
            Object.entries(item.attributes).forEach(([key, value]) => {
              formData.append(`attribute_${key}`, value);
            });
          }
        }
        
        const response = await fetch(`${WORDPRESS_URL}/?wc-ajax=add_to_cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });
        
        const result = await response.json();
        console.log(`Added product ${item.id}:`, result);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Redirect to check-out page after all items are added
      console.log('All items added, redirecting to check-out...');
      window.location.href = `${WORDPRESS_URL}/check-out/`;
      
    } catch (error) {
      console.error('AJAX cart error:', error);
      // Fallback to URL method
      this.redirectWithFallback(cartItems);
    }
  },

  /**
   * Fallback method using URL parameters
   */
  redirectWithFallback(cartItems) {
    const checkoutUrl = this.buildAddToCartURL(cartItems);
    console.log('Using fallback URL method:', checkoutUrl);
    window.location.href = checkoutUrl;
  }
};