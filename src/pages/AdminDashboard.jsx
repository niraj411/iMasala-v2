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
  BarChart3, Utensils, ChevronRight, Settings, ChefHat, Flame, Calculator
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminNotificationSetup from '../components/admin/AdminNotificationSetup';
import ModifierManager from '../components/admin/ModifierManager';
import KitchenDisplay from '../components/admin/KitchenDisplay';
import AccountingReport from '../components/admin/AccountingReport';


// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
  const colors = {
    primary: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    yellow: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-sm text-white/40 mt-1 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>}
    </div>
  );
};

// Order Card Component for Admin
const OrderCard = ({ order, onStatusUpdate, onViewDetails }) => {
  const statusColors = {
    'pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'processing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'on-hold': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'completed': 'bg-green-500/10 text-green-400 border-green-500/20',
    'cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
    'refunded': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const statusDots = {
    'pending': 'bg-amber-400',
    'processing': 'bg-blue-400',
    'on-hold': 'bg-orange-400',
    'completed': 'bg-green-400',
    'cancelled': 'bg-red-400',
    'refunded': 'bg-gray-400',
  };

  const orderType = order.meta_data?.find(m => m.key === 'order_type')?.value || 'pickup';
  const isCatering = orderType === 'catering';
  const isTaxExempt = order.meta_data?.find(m => m.key === 'tax_exempt')?.value === 'yes';

  // Get tip amount from fee_lines or meta_data
  const tipFromFees = order.fee_lines?.find(f => f.name?.toLowerCase().includes('tip'))?.total;
  const tipFromMeta = order.meta_data?.find(m => m.key === 'tip_amount' || m.key === '_tip_amount')?.value;
  const tipAmount = parseFloat(tipFromFees || tipFromMeta || 0);

  // Get scheduled time
  const pickupTime = order.meta_data?.find(m => m.key === 'pickup_time' || m.key === 'scheduled_time')?.value;

  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-white/15 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white tracking-tight">#{order.id}</span>
            {isCatering && (
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded-lg font-semibold border border-purple-500/20">
                Catering
              </span>
            )}
            {isTaxExempt && (
              <ShieldCheck className="w-4 h-4 text-green-400" strokeWidth={2} />
            )}
          </div>
          <p className="text-xs text-white/40 font-medium">
            {new Date(order.date_created).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border flex items-center gap-2 ${statusColors[order.status] || 'bg-gray-500/10'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusDots[order.status]} animate-pulse`}></span>
          {order.status}
        </span>
      </div>

      {/* Customer */}
      <div className="mb-3 pb-3 border-b border-white/5">
        <p className="text-sm font-medium text-white/90">
          {order.billing?.first_name} {order.billing?.last_name}
        </p>
        {order.billing?.email && (
          <p className="text-xs text-white/40 font-medium mt-0.5">{order.billing.email}</p>
        )}
      </div>

      {/* Scheduled Time */}
      {pickupTime && (
        <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-xs text-blue-300 font-medium flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {pickupTime === 'ASAP' ? 'ASAP' : pickupTime}
          </p>
        </div>
      )}

      {/* Items Preview */}
      <div className="mb-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
        <p className="text-xs text-white/40 font-medium">
          {order.line_items?.length || 0} item{order.line_items?.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-baseline justify-between mt-0.5">
          <p className="text-lg font-bold text-white tracking-tight">
            ${parseFloat(order.total).toFixed(2)}
          </p>
          {tipAmount > 0 && (
            <p className="text-xs text-green-400 font-medium">
              +${tipAmount.toFixed(2)} tip
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <select
          value={order.status}
          onChange={(e) => onStatusUpdate(order.id, e.target.value)}
          className="flex-1 px-3 py-2 text-xs backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
        >
          <option value="pending" className="bg-black">Pending</option>
          <option value="processing" className="bg-black">Processing</option>
          <option value="on-hold" className="bg-black">On Hold</option>
          <option value="completed" className="bg-black">Completed</option>
          <option value="cancelled" className="bg-black">Cancelled</option>
        </select>
        <button
          onClick={() => onViewDetails(order)}
          className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <Eye className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

// Order Detail Modal
const OrderDetailModal = ({ order, isOpen, onClose, onStatusUpdate }) => {
  if (!isOpen || !order) return null;

  const statusColors = {
    'pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'processing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'on-hold': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'completed': 'bg-green-500/10 text-green-400 border-green-500/20',
    'cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const isTaxExempt = order.meta_data?.find(m => m.key === 'tax_exempt')?.value === 'yes';
  const orderType = order.meta_data?.find(m => m.key === 'order_type')?.value || 'pickup';
  const pickupTime = order.meta_data?.find(m => m.key === 'pickup_time' || m.key === 'scheduled_time')?.value;

  // Get tip amount from fee_lines or meta_data
  const tipFromFees = order.fee_lines?.find(f => f.name?.toLowerCase().includes('tip'))?.total;
  const tipFromMeta = order.meta_data?.find(m => m.key === 'tip_amount' || m.key === '_tip_amount')?.value;
  const tipAmount = parseFloat(tipFromFees || tipFromMeta || 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Order #{order.id}</h2>
            <p className="text-sm text-white/40 font-medium mt-1">
              {new Date(order.date_created).toLocaleString()}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/60" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status & Type */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${statusColors[order.status] || 'bg-gray-500/10'}`}>
              {order.status}
            </span>
            <span className="px-3 py-1.5 bg-white/5 text-white/70 rounded-xl text-sm font-semibold capitalize border border-white/10">
              {orderType}
            </span>
            {isTaxExempt && (
              <span className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-xl text-sm font-semibold flex items-center gap-1.5 border border-green-500/20">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                Tax Exempt
              </span>
            )}
          </div>

          {/* Pickup/Delivery Info */}
          {pickupTime && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-sm text-blue-300 font-medium">
                <Clock className="w-4 h-4" strokeWidth={1.5} />
                <span>
                  {pickupTime === 'ASAP' ? 'ASAP Pickup' : `Scheduled: ${pickupTime}`}
                </span>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <h3 className="font-semibold text-white/70 mb-3 uppercase tracking-wider text-sm">Customer</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-white">
                {order.billing?.first_name} {order.billing?.last_name}
              </p>
              {order.billing?.email && (
                <p className="text-white/60 flex items-center gap-2 font-medium">
                  <Mail className="w-4 h-4" strokeWidth={1.5} />
                  {order.billing.email}
                </p>
              )}
              {order.billing?.phone && (
                <p className="text-white/60 flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4" strokeWidth={1.5} />
                  {order.billing.phone}
                </p>
              )}
              {orderType !== 'pickup' && order.billing?.address_1 && (
                <div className="flex items-start gap-2 text-white/60 pt-2 border-t border-white/5 font-medium">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p>{order.billing.address_1}</p>
                    {order.billing.address_2 && <p>{order.billing.address_2}</p>}
                    <p>
                      {order.billing.city}, {order.billing.state} {order.billing.postcode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <h3 className="font-semibold text-white/70 mb-3 uppercase tracking-wider text-sm">Order Items</h3>
            <div className="space-y-3">
              {order.line_items?.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xs font-semibold text-white/40 bg-white/5 rounded-lg px-2 py-1 min-w-[2rem] text-center">
                      {item.quantity}×
                    </span>
                    <div>
                      <span className="text-sm text-white font-medium block">{item.name}</span>
                      {item.meta_data && item.meta_data.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {item.meta_data.map((meta, idx) => (
                            <p key={idx} className="text-xs text-white/40">
                              {meta.display_key}: {meta.display_value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-white ml-4">
                    ${parseFloat(item.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60 font-medium">Subtotal</span>
                <span className="text-white font-semibold">${parseFloat(order.total - (order.total_tax || 0) - tipAmount).toFixed(2)}</span>
              </div>
              {order.shipping_total && parseFloat(order.shipping_total) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/60 font-medium">Delivery</span>
                  <span className="text-white font-semibold">${parseFloat(order.shipping_total).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-white/60 font-medium">
                  Tax {isTaxExempt && <span className="text-green-400">(Exempt)</span>}
                </span>
                <span className="text-white font-semibold">${parseFloat(order.total_tax || 0).toFixed(2)}</span>
              </div>
              {tipAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400 font-medium">Tip</span>
                  <span className="text-green-400 font-semibold">${tipAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-white/10">
                <span className="text-white/90">Total</span>
                <span className="text-white">${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <h3 className="font-semibold text-white/70 mb-2 uppercase tracking-wider text-sm">Payment</h3>
            <p className="text-sm text-white/80 font-medium capitalize">{order.payment_method_title || order.payment_method}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-white/[0.02]">
          <div className="flex gap-3">
            <select
              value={order.status}
              onChange={(e) => onStatusUpdate(order.id, e.target.value)}
              className="flex-1 px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-2 focus:ring-white/20 transition-all"
            >
              <option value="pending" className="bg-black">Pending</option>
              <option value="processing" className="bg-black">Processing</option>
              <option value="on-hold" className="bg-black">On Hold</option>
              <option value="completed" className="bg-black">Completed</option>
              <option value="cancelled" className="bg-black">Cancelled</option>
            </select>
            <button
              onClick={onClose}
              className="px-6 py-3 backdrop-blur-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Server Status Component
const ServerStatus = () => {
  const [status, setStatus] = useState({ woocommerce: 'checking', stripe: 'checking' });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      await woocommerceService.getProducts({ per_page: 1 });
      setStatus(prev => ({ ...prev, woocommerce: 'connected' }));
    } catch (error) {
      setStatus(prev => ({ ...prev, woocommerce: 'error' }));
    }
  };

  const statusConfig = {
    checking: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Checking...' },
    connected: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Connected' },
    error: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Error' }
  };

  return (
    <div className="space-y-3">
      {Object.entries(status).map(([service, state]) => {
        const config = statusConfig[state];
        return (
          <div key={service} className="flex items-center justify-between">
            <span className="text-sm text-white/60 font-medium capitalize">{service}</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${config.bg} ${config.color} ${config.border}`}>
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Main Component
export default function AdminDashboard() {
  const { orders, loading, refreshOrders, smartRefresh, lastRefresh, isChecking } = useOrders();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('kitchen');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    toast.success('Orders refreshed!');
    setRefreshing(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await woocommerceService.updateOrderStatus(orderId, newStatus);
      await refreshOrders();
      toast.success(`Order #${orderId} updated to ${newStatus}`);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, status: newStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchQuery === '' || 
      order.id.toString().includes(searchQuery) ||
      `${order.billing?.first_name} ${order.billing?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.billing?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Helper to get tip from an order
  const getOrderTip = (order) => {
    const tipFromFees = order.fee_lines?.find(f => f.name?.toLowerCase().includes('tip'))?.total;
    const tipFromMeta = order.meta_data?.find(m => m.key === 'tip_amount' || m.key === '_tip_amount')?.value;
    return parseFloat(tipFromFees || tipFromMeta || 0);
  };

  // Date helpers
  const isToday = (date) => {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  };

  const isThisWeek = (date) => {
    const now = new Date();
    const d = new Date(date);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  };

  const isThisMonth = (date) => {
    const now = new Date();
    const d = new Date(date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  // Calculate comprehensive stats
  const completedOrders = orders.filter(o => o.status === 'completed');
  const todayOrders = orders.filter(o => isToday(o.date_created));
  const weekOrders = orders.filter(o => isThisWeek(o.date_created));
  const monthOrders = orders.filter(o => isThisMonth(o.date_created));

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    revenue: completedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0),
    // New analytics
    todayRevenue: todayOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseFloat(o.total), 0),
    weekRevenue: weekOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseFloat(o.total), 0),
    monthRevenue: monthOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseFloat(o.total), 0),
    todayOrders: todayOrders.length,
    weekOrders: weekOrders.length,
    totalTips: orders.reduce((sum, o) => sum + getOrderTip(o), 0),
    todayTips: todayOrders.reduce((sum, o) => sum + getOrderTip(o), 0),
    avgOrderValue: completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0) / completedOrders.length
      : 0,
    cateringOrders: orders.filter(o => o.meta_data?.find(m => m.key === 'order_type')?.value === 'catering').length,
    pickupOrders: orders.filter(o => {
      const type = o.meta_data?.find(m => m.key === 'order_type')?.value;
      return !type || type === 'pickup';
    }).length,
  };

  // Calculate top selling items
  const itemCounts = {};
  orders.forEach(order => {
    order.line_items?.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      itemCounts[item.name].quantity += item.quantity;
      itemCounts[item.name].revenue += parseFloat(item.total);
    });
  });
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Orders by hour (last 24 hours)
  const ordersByHour = Array(24).fill(0);
  todayOrders.forEach(order => {
    const hour = new Date(order.date_created).getHours();
    ordersByHour[hour]++;
  });

  const tabs = [
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'All Orders', icon: Package },
    { id: 'accounting', label: 'Accounting', icon: Calculator },
    { id: 'modifiers', label: 'Modifiers', icon: Settings },
    { id: 'settings', label: 'Settings', icon: Server }
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
              Admin Dashboard
            </h1>
            <p className="text-white/40 font-medium">
              Welcome back, {user?.name}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 mb-6 overflow-hidden">
          <nav className="flex border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-white text-white bg-white/5'
                      : 'border-transparent text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 mx-auto mb-4">
                <div className="w-full h-full border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
              <p className="text-white/40 font-medium">Loading orders...</p>
            </div>
          ) : (
            <>
              <AdminNotificationSetup
                adminEmail={user?.email}
                adminName={user?.name || 'Staff Member'}
              />

              {/* Kitchen Tab */}
              {activeTab === 'kitchen' && (
                <KitchenDisplay
                  orders={orders}
                  onStatusUpdate={handleStatusUpdate}
                  onViewDetails={setSelectedOrder}
                  onRefresh={handleRefresh}
                  refreshing={refreshing}
                  smartRefresh={smartRefresh}
                  lastRefresh={lastRefresh}
                  isChecking={isChecking}
                />
              )}

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Today's Summary */}
                  <div className="backdrop-blur-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl border border-orange-500/20 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      Today's Summary
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <p className="text-3xl font-bold text-white">{stats.todayOrders}</p>
                        <p className="text-sm text-white/50 mt-1">Orders</p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <p className="text-3xl font-bold text-green-400">${stats.todayRevenue.toFixed(0)}</p>
                        <p className="text-sm text-white/50 mt-1">Revenue</p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <p className="text-3xl font-bold text-emerald-400">${stats.todayTips.toFixed(2)}</p>
                        <p className="text-sm text-white/50 mt-1">Tips</p>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-xl">
                        <p className="text-3xl font-bold text-blue-400">${stats.avgOrderValue.toFixed(0)}</p>
                        <p className="text-sm text-white/50 mt-1">Avg Order</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                      title="Total Orders"
                      value={stats.total}
                      icon={Package}
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
                      title="Total Revenue"
                      value={`$${stats.revenue.toFixed(0)}`}
                      icon={DollarSign}
                      color="green"
                      subtitle="Completed orders"
                    />
                  </div>

                  {/* Revenue & Analytics Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Breakdown */}
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Revenue Breakdown
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-white/70 font-medium">Today</span>
                          <span className="text-xl font-bold text-white">${stats.todayRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-white/70 font-medium">This Week</span>
                          <span className="text-xl font-bold text-white">${stats.weekRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <span className="text-white/70 font-medium">This Month</span>
                          <span className="text-xl font-bold text-white">${stats.monthRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <span className="text-green-400 font-medium">Total Tips</span>
                          <span className="text-xl font-bold text-green-400">${stats.totalTips.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Selling Items */}
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                        Top Selling Items
                      </h3>
                      {topItems.length > 0 ? (
                        <div className="space-y-3">
                          {topItems.map((item, idx) => (
                            <div key={item.name} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                                idx === 2 ? 'bg-orange-700/20 text-orange-400' :
                                'bg-white/10 text-white/60'
                              }`}>
                                #{idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{item.name}</p>
                                <p className="text-xs text-white/40">{item.quantity} sold</p>
                              </div>
                              <span className="text-green-400 font-semibold">${item.revenue.toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/40 text-center py-8">No sales data yet</p>
                      )}
                    </div>
                  </div>

                  {/* Orders by Hour & Order Types */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Orders by Hour */}
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Today's Orders by Hour
                      </h3>
                      <div className="flex items-end gap-1 h-32">
                        {ordersByHour.map((count, hour) => {
                          const maxCount = Math.max(...ordersByHour, 1);
                          const height = (count / maxCount) * 100;
                          const isNow = new Date().getHours() === hour;
                          return (
                            <div
                              key={hour}
                              className="flex-1 flex flex-col items-center gap-1"
                              title={`${hour}:00 - ${count} orders`}
                            >
                              <div
                                className={`w-full rounded-t transition-all ${
                                  isNow ? 'bg-orange-500' : count > 0 ? 'bg-blue-500/60' : 'bg-white/10'
                                }`}
                                style={{ height: `${Math.max(height, 4)}%` }}
                              />
                              {hour % 4 === 0 && (
                                <span className="text-[10px] text-white/40">{hour}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-white/40 text-center mt-2">Hours (0-23)</p>
                    </div>

                    {/* Order Types */}
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-400" />
                        Order Types
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">Pickup Orders</span>
                            <span className="text-2xl font-bold text-white">{stats.pickupOrders}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${stats.total > 0 ? (stats.pickupOrders / stats.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-purple-400 font-medium">Catering Orders</span>
                            <span className="text-2xl font-bold text-purple-400">{stats.cateringOrders}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${stats.total > 0 ? (stats.cateringOrders / stats.total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-semibold text-white tracking-tight">Recent Orders</h2>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-sm text-white/60 hover:text-white font-medium flex items-center gap-1 transition-colors"
                      >
                        View all
                        <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
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
                      <p className="text-center text-white/40 py-12 font-medium">No orders yet</p>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" strokeWidth={1.5} />
                        <input
                          type="text"
                          placeholder="Search orders..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium text-sm"
                        />
                      </div>

                      {/* Status Filter */}
                      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        {['all', 'pending', 'processing', 'on-hold', 'completed'].map(status => (
                          <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                              filter === status 
                                ? 'bg-white text-black' 
                                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
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
                    <div className="text-center py-16 backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10">
                      <Package className="w-16 h-16 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-white/40 font-medium">No orders found</p>
                    </div>
                  )}
                </div>
              )}

              {/* Accounting Tab */}
              {activeTab === 'accounting' && (
                <AccountingReport />
              )}

              {/* Modifiers Tab */}
              {activeTab === 'modifiers' && (
                <ModifierManager />
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Server Status */}
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 tracking-tight">
                      <Server className="w-5 h-5 text-white/60" strokeWidth={1.5} />
                      Server Status
                    </h3>
                    <ServerStatus />
                  </div>

                  {/* Quick Links */}
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">Quick Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <a
                        href="https://tandoorikitchenco.com/wp-admin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 py-3 px-4 rounded-xl transition-all font-semibold border border-blue-500/20"
                      >
                        <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                        WordPress Admin
                      </a>
                      <a
                        href="https://tandoorikitchenco.com/wp-admin/admin.php?page=wc-admin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 py-3 px-4 rounded-xl transition-all font-semibold border border-purple-500/20"
                      >
                        <Package className="w-4 h-4" strokeWidth={1.5} />
                        WooCommerce
                      </a>
                      <a
                        href="https://dashboard.stripe.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 py-3 px-4 rounded-xl transition-all font-semibold border border-indigo-500/20"
                      >
                        <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                        Stripe Dashboard
                      </a>
                      <a
                        href="https://5.183.11.161:2083"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-gray-500/10 hover:bg-gray-500/20 text-gray-300 py-3 px-4 rounded-xl transition-all font-semibold border border-gray-500/20"
                      >
                        <Server className="w-4 h-4" strokeWidth={1.5} />
                        cPanel
                      </a>
                    </div>
                  </div>

                  {/* App Info */}
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">App Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <span className="text-white/40 font-medium">Version</span>
                        <span className="font-semibold text-white">1.0.0</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <span className="text-white/40 font-medium">Environment</span>
                        <span className="font-semibold text-white">
                          {import.meta.env.DEV ? 'Development' : 'Production'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 font-medium">API Endpoint</span>
                        <span className="font-semibold text-white text-xs">tandoorikitchenco.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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