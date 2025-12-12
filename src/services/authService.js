import axios from 'axios';

const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || 'https://tandoorikitchenco.com';
const WORDPRESS_API = `${WORDPRESS_URL}/wp-json/wp/v2`;
const JWT_AUTH = `${WORDPRESS_URL}/wp-json/jwt-auth/v1`;

export const authService = {
  async login(username, password) {
    try {
      const response = await axios.post(`${JWT_AUTH}/token`, {
        username,
        password
      });

      if (response.data.token) {
        // Get user details with email
        const userResponse = await axios.get(`${WORDPRESS_API}/users/me`, {
          headers: {
            Authorization: `Bearer ${response.data.token}`
          },
          params: {
            context: 'edit' // This returns email field
          }
        });

        return {
          token: response.data.token,
          user: userResponse.data
        };
      }
      throw new Error('Authentication failed');
    } catch (error) {
      throw new Error('Login failed: ' + (error.response?.data?.message || error.message));
    }
  },

  async validateToken() {
    const token = localStorage.getItem('wc_token');
    if (!token) throw new Error('No token found');

    const response = await axios.get(`${WORDPRESS_API}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        context: 'edit' // This returns email field
      }
    });

    return response.data;
  }
};