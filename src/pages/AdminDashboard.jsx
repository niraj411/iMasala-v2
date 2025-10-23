import React, { useState, useEffect } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import OrderCard from '../components/orders/OrderCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { RefreshCw, Package, Server } from 'lucide-react';

// Simple components for testing
const SimpleStats = ({ orders }) => {
  const stats = {
    total: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    processing: orders.filter(order => order.status === 'processing').length,
    completed: orders.filter(order => order.status === 'completed').length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total', value: stats.total, color: 'blue' },
        { label: 'Pending', value: stats.pending, color: 'yellow' },
        { label: 'Processing', value: stats.processing, color: 'orange' },
        { label: 'Completed', value: stats.completed, color: 'green' },
      ].map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const SimpleServerStatus = () => {
  const [isOnline, setIsOnline] = useState(null);

  const checkStatus = async () => {
    try {
      const response = await fetch('https://tandoorikitchenco.com/', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Server className="w-5 h-5" />
        Server Status
      </h3>
      <div className={`p-4 rounded-lg ${
        isOnline === null ? 'bg-gray-100' : 
        isOnline ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
      }`}>
        <p className={`font-semibold ${
          isOnline === null ? 'text-gray-700' : 
          isOnline ? 'text-green-700' : 'text-red-700'
        }`}>
          {isOnline === null ? 'Checking...' : 
           isOnline ? '✅ Server Online' : '❌ Server Offline'}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          tandoorikitchenco.com (5.183.11.161)
        </p>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { orders, loading, updateOrderStatus, fetchOrders } = useOrders();
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const refreshAll = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const result = await updateOrderStatus(orderId, newStatus);
    return result;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshAll}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={logout}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Simple Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <nav className="flex -mb-px">
            {['overview', 'orders', 'server'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <SimpleStats orders={orders} />
            
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {orders.slice(0, 4).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    editable={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Simple Filter */}
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'processing', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    filter === status 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : status}
                </button>
              ))}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  editable={true}
                />
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No orders found</p>
              </div>
            )}
          </div>
        )}

        {/* Server Tab */}
        {activeTab === 'server' && (
          <div className="space-y-6">
            <SimpleServerStatus />
            
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://tandoorikitchenco.com/wp-admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  WordPress Admin
                </a>
                <a
                  href="https://5.183.11.161:2083"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  cPanel Access
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}