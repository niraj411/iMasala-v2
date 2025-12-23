// src/services/storageService.js
// Unified storage service for web and native platforms
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

class StorageService {
  // Check platform at call time (not constructor time) for reliable iOS detection
  get isNative() {
    return Capacitor.isNativePlatform();
  }

  async get(key) {
    try {
      if (this.isNative) {
        const { value } = await Preferences.get({ key });
        return value;
      }
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage get error:', error);
      // Fallback to localStorage
      return localStorage.getItem(key);
    }
  }

  async set(key, value) {
    try {
      if (this.isNative) {
        await Preferences.set({ key, value: String(value) });
      }
      // Always set localStorage as backup
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
      localStorage.setItem(key, value);
    }
  }

  async remove(key) {
    try {
      if (this.isNative) {
        await Preferences.remove({ key });
      }
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
      localStorage.removeItem(key);
    }
  }

  async clear() {
    try {
      if (this.isNative) {
        await Preferences.clear();
      }
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      localStorage.clear();
    }
  }
}

export const storageService = new StorageService();
export default storageService;
