import React, { useState, useEffect } from 'react';
import { Server, Wifi, WifiOff, Clock, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { serverStatusService } from '../../services/serverStatusService';

const ServerStatus = ({ serverStatus }) => {
  const [currentStatus, setCurrentStatus] = useState(serverStatus);

  const refreshStatus = async () => {
    const status = await serverStatusService.getServerMetrics();
    setCurrentStatus(status);
  };

  useEffect(() => {
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const { status } = currentStatus || {};

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Server className="w-5 h-5" />
          Server Status
        </h2>
      </div>
      
      <div className="p-6">
        {status ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg border-2 ${
              status.online ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Status</span>
                {status.online ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {status.online ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-lg font-semibold ${
                  status.online ? 'text-green-700' : 'text-red-700'
                }`}>
                  {status.online ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Response Time</span>
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {status.online ? `${status.responseTime}ms` : 'N/A'}
              </p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Last Checked</span>
                <Clock className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(status.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking server status...</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={refreshStatus}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerStatus;