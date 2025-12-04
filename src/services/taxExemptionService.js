// src/services/taxExemptionService.js
// Tax Exemption Service - Uses localStorage with optional WooCommerce sync

const STORAGE_KEY = 'tax_exemption_data';

export const taxExemptionService = {
  /**
   * Get tax exemption data for a user
   * @param {string} userId - User ID or email
   * @returns {Object|null} Tax exemption data
   */
  getTaxExemption(userId) {
    try {
      if (!userId) return null;
      
      const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const userData = allData[userId];
      
      if (!userData) return null;
      
      // Check if exemption has expired
      if (userData.expiryDate) {
        const expiry = new Date(userData.expiryDate);
        const today = new Date();
        if (expiry < today) {
          // Expired - mark as not verified
          return {
            ...userData,
            verified: false,
            expired: true
          };
        }
      }
      
      return userData;
    } catch (error) {
      console.error('Error getting tax exemption:', error);
      return null;
    }
  },

  /**
   * Save/update tax exemption data
   * @param {string} userId - User ID or email
   * @param {Object} exemptionData - Tax exemption details
   * @returns {Object} Updated exemption data
   */
  saveTaxExemption(userId, exemptionData) {
    try {
      if (!userId) throw new Error('User ID required');
      
      const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      
      const dataToSave = {
        licenseNumber: exemptionData.licenseNumber?.trim() || '',
        state: exemptionData.state || 'CO',
        expiryDate: exemptionData.expiryDate || '',
        organizationName: exemptionData.organizationName || '',
        verified: true, // Auto-verify when saved (manual review can change this)
        createdAt: allData[userId]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      allData[userId] = dataToSave;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
      
      return dataToSave;
    } catch (error) {
      console.error('Error saving tax exemption:', error);
      throw error;
    }
  },

  /**
   * Remove tax exemption for a user
   * @param {string} userId - User ID or email
   */
  removeTaxExemption(userId) {
    try {
      if (!userId) return;
      
      const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      delete allData[userId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    } catch (error) {
      console.error('Error removing tax exemption:', error);
    }
  },

  /**
   * Verify if a license number is valid (basic validation)
   * @param {string} licenseNumber - Tax exempt license number
   * @param {string} state - State code
   * @returns {boolean} Whether format is valid
   */
  validateLicenseFormat(licenseNumber, state = 'CO') {
    if (!licenseNumber || licenseNumber.trim().length < 5) {
      return false;
    }
    
    // Basic validation - at least 5 characters, alphanumeric with dashes allowed
    const pattern = /^[A-Za-z0-9\-]{5,30}$/;
    return pattern.test(licenseNumber.trim());
  },

  /**
   * Check if user has valid (verified & not expired) tax exemption
   * @param {string} userId - User ID or email
   * @returns {boolean}
   */
  isExempt(userId) {
    const data = this.getTaxExemption(userId);
    return data?.verified === true && !data?.expired;
  },

  // Legacy method for backward compatibility
  async updateTaxExemption(customerId, exemptionData) {
    return this.saveTaxExemption(customerId, exemptionData);
  }
};

export default taxExemptionService;