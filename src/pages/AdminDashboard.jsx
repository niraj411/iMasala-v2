import React, { useState, useEffect } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { woocommerceService } from '../services/woocommerceService';
import { 
  RefreshCw, Package, Server, Users, 
  TrendingUp, DollarSign, Clock, CheckCircle, 
  XCircle, AlertCircle, Search, Filter, 
  ChevronDown, Eye, Printer, 
  ShieldCheck, Calendar, MapPin,
  Phone, Mail, X, ExternalLink,
  BarChart3, Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, onStatusUpdate, onViewDetails }) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'processing': 'bg-blue-100 text-blue-800 border-blue-200',
    'on-hold': 'bg-orange-100 text-orange-800 border-orange-200',
    'completed': 'bg-green-100 text-green-800 border-green-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
    'refunded': 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const orderType = order.meta_data?.find(m => m.key === 'order_type')?.value || 'pickup';
  const isCatering = orderType === 'catering';
  const isTaxExempt = order.meta_data?.find(m => m.key === 'tax_exempt')?.value === 'yes';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">#{order.id}</span>
            {isCatering && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                Catering
              </span>
            )}
            {isTaxExempt && (
              <ShieldCheck className="w-4 h-4 text-green-600" />
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(order.date_created).toLocaleString()}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[order.status] || 'bg-gray-100'}`}>
          {order.status}
        </span>
      </div>

      {/* Customer */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-900">
          {order.billing?.first_name} {order.billing?.last_name}
        </p>
        {order.billing?.email && (
          <p className="text-xs text-gray-500">{order.billing.email}</p>
        )}
      </div>

      {/* Items Preview */}
      <div className="mb-3 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          {order.line_items?.length || 0} item{order.line_items?.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5">
          ${parseFloat(order.total).toFixed(2)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <select
          value={order.status}
          onChange={(e) => onStatusUpdate(order.id, e.target.value)}
          className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => onViewDetails(order)}
          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Order Detail Modal
const OrderDetailModal = ({ order, isOpen, onClose, onStatusUpdate }) => {
  if (!isOpen || !order) return null;

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-orange-100 text-orange-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  const isTaxExempt = order.meta_data?.find(m => m.key === 'tax_exempt')?.value === 'yes';
  const orderType = order.meta_data?.find(m => m.key === 'order_type')?.value || 'pickup';
  const pickupTime = order.meta_data?.find(m => m.key === 'pickup_time')?.value;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
            <p className="text-sm text-gray-500">
              {new Date(order.date_created).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status & Type */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
              {order.status}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
              {orderType}
            </span>
            {isTaxExempt && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Tax Exempt
              </span>
            )}
          </div>

          {/* Pickup/Delivery Info */}
          {pickupTime && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  {pickupTime === 'ASAP' ? 'ASAP Pickup' : `Scheduled: ${pickupTime}`}
                </span>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Customer</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {order.billing?.first_name} {order.billing?.last_name}
              </p>
              {order.billing?.email && (
                <p className="text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {order.billing.email}
                </p>
              )}
              {order.billing?.phone && (
                <p className="text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {order.billing.phone}
                </p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
            <div className="space-y-3">
              {order.line_items?.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.quantity}x {item.name}
                    </p>
                    {/* Show modifier meta */}
                    {item.meta_data?.filter(m => !m.key.startsWith('_')).map((meta, i) => (
                      <p key={i} className="text-xs text-gray-500 mt-0.5">
                        {meta.key}: {meta.value}
                      </p>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${parseFloat(item.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${(parseFloat(order.total) - parseFloat(order.total_tax || 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Tax {isTaxExempt && <span className="text-green-600">(Exempt)</span>}
              </span>
              <span>${parseFloat(order.total_tax || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary-600">${parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t bg-gray-50 flex gap-3">
          <select
            value={order.status}
            onChange={(e) => {
              onStatusUpdate(order.id, e.target.value);
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => window.open(`https://tandoorikitchenco.com/wp-admin/post.php?post=${order.id}&action=edit`, '_blank')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            WooCommerce
          </button>
        </div>
      </div>
    </div>
  );
};

// Server Status Component
const ServerStatus = () => {
  const [isOnline, setIsOnline] = useState(null);

  const checkStatus = async () => {
    try {
      await fetch('https://tandoorikitchenco.com/', { 
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
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`p-4 rounded-lg border ${
      isOnline === null ? 'bg-gray-50 border-gray-200' : 
      isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${
          isOnline === null ? 'bg-gray-400' : 
          isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`} />
        <div>
          <p className={`font-medium ${
            isOnline === null ? 'text-gray-700' : 
            isOnline ? 'text-green-700' : 'text-red-700'
          }`}>
            {isOnline === null ? 'Checking...' : 
             isOnline ? 'Server Online' : 'Server Offline'}
          </p>
          <p className="text-xs text-gray-500">tandoorikitchenco.com</p>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { orders, loading, updateOrderStatus, fetchOrders } = useOrders();
  const { user, logout } = useAuth();
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.total || 0), 0),
    todayOrders: orders.filter(o => {
      const orderDate = new Date(o.date_created).toDateString();
      return orderDate === new Date().toDateString();
    }).length,
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = !searchQuery || 
      order.id.toString().includes(searchQuery) ||
      order.billing?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${order.billing?.first_name} ${order.billing?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const refreshAll = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order #${orderId} updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={refreshAll}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'settings', label: 'Settings', icon: Server },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard 
                title="Today's Orders" 
                value={stats.todayOrders} 
                icon={Calendar}
                color="blue"
              />
              <StatsCard 
                title="Pending" 
                value={stats.pending} 
                icon={Clock}
                color="yellow"
              />
              <StatsCard 
                title="Processing" 
                value={stats.processing} 
                icon={Utensils}
                color="primary"
              />
              <StatsCard 
                title="Revenue" 
                value={`$${stats.revenue.toFixed(0)}`} 
                icon={DollarSign}
                color="green"
                subtitle="Completed orders"
              />
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all →
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {orders.slice(0, 6).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onViewDetails={setSelectedOrder}
                  />
                ))}
              </div>
              {orders.length === 0 && (
                <p className="text-center text-gray-500 py-8">No orders yet</p>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {['all', 'pending', 'processing', 'on-hold', 'completed'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        filter === status 
                          ? 'bg-primary-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status === 'all' ? 'All' : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  onViewDetails={setSelectedOrder}
                />
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Server Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-gray-500" />
                Server Status
              </h3>
              <ServerStatus />
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://tandoorikitchenco.com/wp-admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  WordPress Admin
                </a>
                <a
                  href="https://tandoorikitchenco.com/wp-admin/admin.php?page=wc-admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  <Package className="w-4 h-4" />
                  WooCommerce
                </a>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  <DollarSign className="w-4 h-4" />
                  Stripe Dashboard
                </a>
                <a
                  href="https://5.183.11.161:2083"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  <Server className="w-4 h-4" />
                  cPanel
                </a>
              </div>
            </div>

            {/* App Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">App Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Version</span>
                  <span className="font-medium text-gray-900">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Environment</span>
                  <span className="font-medium text-gray-900">
                    {import.meta.env.DEV ? 'Development' : 'Production'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">API Endpoint</span>
                  <span className="font-medium text-gray-900 text-xs">tandoorikitchenco.com</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}