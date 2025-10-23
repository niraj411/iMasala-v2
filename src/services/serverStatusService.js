import axios from 'axios';

const SERVER_URL = 'https://5.183.11.161/';

export const serverStatusService = {
  async checkServerStatus() {
    try {
      const startTime = Date.now();
      const response = await axios.get(SERVER_URL, { 
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept any status under 500
      });
      const responseTime = Date.now() - startTime;
      
      return {
        online: true,
        responseTime,
        statusCode: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        online: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  async getServerMetrics() {
    try {
      // You can expand this to get more server metrics
      // For now, we'll just check basic status
      const status = await this.checkServerStatus();
      
      return {
        status,
        uptime: 'Unknown', // You'd need server-side endpoint for this
        load: 'Unknown',
        memory: 'Unknown'
      };
    } catch (error) {
      return {
        status: { online: false, error: error.message },
        uptime: 'Unknown',
        load: 'Unknown',
        memory: 'Unknown'
      };
    }
  }
};