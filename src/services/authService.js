import axios from 'axios';

const WORDPRESS_API = 'https://tandoorikitchenco.com/wp-json/wp/v2';
const JWT_AUTH = 'https://tandoorikitchenco.com/wp-json/jwt-auth/v1';

export const authService = {
  async login(username, password) {
    try {
      const response = await axios.post(`${JWT_AUTH}/token`, {
        username,
        password
      });

      if (response.data.token) {
        // Get user details
        const userResponse = await axios.get(`${WORDPRESS_API}/users/me`, {
          headers: {
            Authorization: `Bearer ${response.data.token}`
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
      }
    });

    return response.data;
  }
};