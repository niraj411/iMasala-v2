import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';
import { storageService } from './storageService';

const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL || 'https://tandoorikitchenco.com';
const WORDPRESS_API = `${WORDPRESS_URL}/wp-json/wp/v2`;
const JWT_AUTH = `${WORDPRESS_URL}/wp-json/jwt-auth/v1`;

const isNative = Capacitor.isNativePlatform();

// Native HTTP request helper
async function nativePost(url, data) {
  const response = await CapacitorHttp.request({
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data
  });

  let responseData = response.data;
  if (typeof responseData === 'string') {
    try {
      responseData = JSON.parse(responseData);
    } catch (e) {}
  }

  if (response.status >= 400) {
    throw new Error(responseData?.message || 'Request failed');
  }

  return { data: responseData };
}

async function nativeGet(url, headers = {}) {
  const response = await CapacitorHttp.request({
    url,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers
    }
  });

  let responseData = response.data;
  if (typeof responseData === 'string') {
    try {
      responseData = JSON.parse(responseData);
    } catch (e) {}
  }

  if (response.status >= 400) {
    throw new Error(responseData?.message || 'Request failed');
  }

  return { data: responseData };
}

export const authService = {
  async login(username, password) {
    try {
      let response;

      if (isNative) {
        response = await nativePost(`${JWT_AUTH}/token`, { username, password });
      } else {
        response = await axios.post(`${JWT_AUTH}/token`, { username, password });
      }

      if (response.data.token) {
        // Get user details with email
        let userResponse;
        const userUrl = `${WORDPRESS_API}/users/me?context=edit`;

        if (isNative) {
          userResponse = await nativeGet(userUrl, {
            Authorization: `Bearer ${response.data.token}`
          });
        } else {
          userResponse = await axios.get(`${WORDPRESS_API}/users/me`, {
            headers: {
              Authorization: `Bearer ${response.data.token}`
            },
            params: {
              context: 'edit'
            }
          });
        }

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
    const token = await storageService.get('wc_token');
    if (!token) throw new Error('No token found');

    let response;
    const userUrl = `${WORDPRESS_API}/users/me?context=edit`;

    if (isNative) {
      response = await nativeGet(userUrl, {
        Authorization: `Bearer ${token}`
      });
    } else {
      response = await axios.get(`${WORDPRESS_API}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          context: 'edit'
        }
      });
    }

    return response.data;
  }
};