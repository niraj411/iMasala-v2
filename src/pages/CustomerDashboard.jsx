import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import {
  Package, ShieldCheck, Tag, MapPin, RotateCcw,
  Clock, ChefHat, CheckCircle2, Truck, AlertCircle,
  Plus, Trash2, Edit2, Star, Calendar, TrendingUp,
  User, LogOut, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderCard from '../components/orders/OrderCard';
import TaxExemptionManager from '../components/customer/TaxExemptionManager';
import { woocommerceService } from '../services/woocommerceService';
import toast from 'react-hot-toast';

// Order status config
const STATUS_CONFIG = {
  'pending': { label: 'Pending', color: 'yellow', icon: Clock },
  'processing': { label: 'Preparing', color: 'blue', icon: ChefHat },
  'on-hold': { label: 'On Hold', color: 'orange', icon: AlertCircle },
  'completed': { label: 'Completed', color: 'green', icon: CheckCircle2 },
  'ready': { label: 'Ready for Pickup', color: 'green', icon: CheckCircle2 },
  'out-for-delivery': { label: 'Out for Delivery', color: 'purple', icon: Truck },
};

export default function CustomerDashboard() {
  const { user, logout, deleteAccount } = useAuth();
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [reordering, setReordering] = useState(false);
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    address: '',
    city: '',
    state: 'CO',
    zipCode: '',
    isDefault: false
  });

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching orders for:', user.email);
        const customerOrders = await woocommerceService.getOrdersByEmail(user.email);
        console.log('Found orders:', customerOrders.length);
        setOrders(customerOrders);
      } catch (error) {
        console.error('Error fetching customer orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerOrders();
    loadSavedAddresses();
  }, [user?.email]);

  // Load saved addresses from localStorage
  const loadSavedAddresses = () => {
    if (user?.id) {
      const saved = localStorage.getItem(`addresses_${user.id}`);
      if (saved) {
        setSavedAddresses(JSON.parse(saved));
      }
    }
  };

  // Save addresses to localStorage
  const saveAddresses = (addresses) => {
    if (user?.id) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(addresses));
      setSavedAddresses(addresses);
    }
  };

  // Get active orders (pending, processing, on-hold)
  const activeOrders = orders.filter(order => 
    ['pending', 'processing', 'on-hold'].includes(order.status)
  );

  // Get last completed order for quick reorder
  const lastOrder = orders.find(order => 
    ['completed', 'processing'].includes(order.status)
  );

  // Calculate stats
  const totalOrders = orders.length;
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently';
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

  // Handle quick reorder
  const handleReorder = async () => {
    if (!lastOrder) return;
    
    setReordering(true);
    try {
      clearCart();
      
      for (const item of lastOrder.line_items) {
        // Skip fees/tax items
        if (item.name === 'Tax' || item.name === 'Delivery Fee' || item.name === 'Tip') continue;
        
        addToCart({
          id: item.product_id || item.id,
          name: item.name,
          price: parseFloat(item.price || item.total / item.quantity),
          quantity: item.quantity,
          image: item.image?.src
        });
      }
      
      toast.success('Items added to cart!');
      navigate('/checkout');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder. Please try again.');
    } finally {
      setReordering(false);
    }
  };

  // Address form handlers
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    
    let updated;
    if (editingAddress !== null) {
      updated = savedAddresses.map((addr, idx) => 
        idx === editingAddress ? { ...addressForm } : addr
      );
    } else {
      updated = [...savedAddresses, { ...addressForm }];
    }
    
    // If this is set as default, unset others
    if (addressForm.isDefault) {
      updated = updated.map((addr, idx) => ({
        ...addr,
        isDefault: editingAddress !== null 
          ? idx === editingAddress 
          : idx === updated.length - 1
      }));
    }
    
    saveAddresses(updated);
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({ label: '', address: '', city: '', state: 'CO', zipCode: '', isDefault: false });
    toast.success(editingAddress !== null ? 'Address updated!' : 'Address saved!');
  };

  const handleEditAddress = (index) => {
    setAddressForm(savedAddresses[index]);
    setEditingAddress(index);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (index) => {
    const updated = savedAddresses.filter((_, idx) => idx !== index);
    saveAddresses(updated);
    toast.success('Address deleted');
  };

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'tax', label: 'Tax Exemption', icon: ShieldCheck },
    { id: 'offers', label: 'Special Offers', icon: Tag },
    { id: 'account', label: 'Account', icon: User }
  ];

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    setDeleting(true);
    const result = await deleteAccount();
    setDeleting(false);

    if (result.success) {
      toast.success('Account deleted successfully');
      navigate('/');
    } else {
      toast.error(result.error);
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Welcome Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h1>
              <p className="text-white/40 font-medium">
                Manage your orders and account settings
              </p>
            </div>
            
            {/* Stats Row */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-white/40 text-xs font-medium mb-1">
                  <Calendar className="w-3 h-3" />
                  Member Since
                </div>
                <p className="text-white font-semibold">{memberSince}</p>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-white/40 text-xs font-medium mb-1">
                  <Package className="w-3 h-3" />
                  Orders
                </div>
                <p className="text-white font-semibold">{totalOrders}</p>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-center">
                <div className="flex items-center gap-1.5 text-white/40 text-xs font-medium mb-1">
                  <TrendingUp className="w-3 h-3" />
                  Total Spent
                </div>
                <p className="text-white font-semibold">${totalSpent.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Order Status */}
        <AnimatePresence>
          {activeOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              {activeOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];
                const StatusIcon = statusConfig.icon;
                const orderType = order.meta_data?.find(m => m.key === 'order_type')?.value;
                const pickupTime = order.meta_data?.find(m => m.key === 'pickup_time_formatted')?.value;
                
                return (
                  <div
                    key={order.id}
                    className={`backdrop-blur-xl bg-${statusConfig.color}-500/10 border border-${statusConfig.color}-500/20 rounded-2xl p-5 mb-3`}
                    style={{
                      background: `rgba(${statusConfig.color === 'yellow' ? '234,179,8' : statusConfig.color === 'blue' ? '59,130,246' : statusConfig.color === 'orange' ? '249,115,22' : '34,197,94'}, 0.1)`,
                      borderColor: `rgba(${statusConfig.color === 'yellow' ? '234,179,8' : statusConfig.color === 'blue' ? '59,130,246' : statusConfig.color === 'orange' ? '249,115,22' : '34,197,94'}, 0.2)`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: `rgba(${statusConfig.color === 'yellow' ? '234,179,8' : statusConfig.color === 'blue' ? '59,130,246' : statusConfig.color === 'orange' ? '249,115,22' : '34,197,94'}, 0.2)`
                          }}
                        >
                          <StatusIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">Order #{order.id}</span>
                            <span 
                              className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{
                                background: `rgba(${statusConfig.color === 'yellow' ? '234,179,8' : statusConfig.color === 'blue' ? '59,130,246' : statusConfig.color === 'orange' ? '249,115,22' : '34,197,94'}, 0.3)`,
                                color: 'white'
                              }}
                            >
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm mt-1">
                            {orderType === 'catering' ? 'Catering Order' : 'Pickup Order'}
                            {pickupTime && ` • ${pickupTime}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">${parseFloat(order.total).toFixed(2)}</p>
                        <p className="text-white/40 text-sm">{order.line_items?.length || 0} items</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Reorder */}
        {lastOrder && !activeOrders.length && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-5 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Quick Reorder</h3>
                  <p className="text-white/40 text-sm">
                    Last order: {lastOrder.line_items?.length || 0} items • ${parseFloat(lastOrder.total).toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReorder}
                disabled={reordering}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {reordering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Reorder
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-6">
          <div className="border-b border-white/10">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-6 text-center border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
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
          <div className="p-6">
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">
                  Order History
                </h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 mx-auto mb-3">
                      <div className="w-full h-full border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        editable={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <Package className="w-8 h-8 text-white/20" strokeWidth={1.5} />
                    </div>
                    <p className="text-white/60 font-medium mb-1">No orders yet</p>
                    <p className="text-white/30 text-sm mb-4">Your orders will appear here once you place them</p>
                    <button
                      onClick={() => navigate('/shop')}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all"
                    >
                      Browse Menu
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Saved Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                    Saved Addresses
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddressForm(true);
                      setEditingAddress(null);
                      setAddressForm({ label: '', address: '', city: '', state: 'CO', zipCode: '', isDefault: false });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Address
                  </button>
                </div>

                {/* Address Form Modal */}
                <AnimatePresence>
                  {showAddressForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <form onSubmit={handleAddressSubmit} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-white/60 mb-2">Label (e.g., "Office", "Home")</label>
                            <input
                              type="text"
                              value={addressForm.label}
                              onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                              placeholder="Office"
                              required
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-white/60 mb-2">Street Address</label>
                            <input
                              type="text"
                              value={addressForm.address}
                              onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                              placeholder="123 Main St"
                              required
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white/60 mb-2">City</label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              placeholder="Lafayette"
                              required
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-white/60 mb-2">State</label>
                              <input
                                type="text"
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                placeholder="CO"
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/60 mb-2">ZIP</label>
                              <input
                                type="text"
                                value={addressForm.zipCode}
                                onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                                placeholder="80026"
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="w-4 h-4 rounded bg-white/10 border-white/20 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm text-white/60">Set as default address</span>
                        </label>
                        
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all"
                          >
                            {editingAddress !== null ? 'Update Address' : 'Save Address'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                            }}
                            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Saved Addresses List */}
                {savedAddresses.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {savedAddresses.map((address, index) => (
                      <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-white/40" />
                            <span className="font-semibold text-white">{address.label}</span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditAddress(index)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-white/40" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(index)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400/60" />
                            </button>
                          </div>
                        </div>
                        <p className="text-white/60 text-sm">
                          {address.address}<br />
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : !showAddressForm && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-white/20" strokeWidth={1.5} />
                    </div>
                    <p className="text-white/60 font-medium mb-1">No saved addresses</p>
                    <p className="text-white/30 text-sm">Save addresses for faster checkout on catering orders</p>
                  </div>
                )}
              </div>
            )}

            {/* Tax Exemption Tab */}
            {activeTab === 'tax' && (
              <div>
                <TaxExemptionManager />
              </div>
            )}

            {/* Special Offers Tab */}
            {activeTab === 'offers' && (
              <div>
                <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">
                  Special Offers & Rewards
                </h2>

                {/* Placeholder for future loyalty/offers */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/30 flex items-center justify-center">
                        <Star className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Catering Discount</h3>
                        <p className="text-white/50 text-sm">For orders over $500</p>
                      </div>
                    </div>
                    <p className="text-orange-300 font-medium">10% off your next catering order</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-white/40" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white/60">More Coming Soon</h3>
                        <p className="text-white/30 text-sm">Stay tuned for rewards</p>
                      </div>
                    </div>
                    <p className="text-white/40 text-sm">We're working on exciting new offers for our loyal customers.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">
                  Account Settings
                </h2>

                {/* Account Info */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <User className="w-7 h-7 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">
                        {user?.first_name} {user?.last_name}
                      </h3>
                      <p className="text-white/50">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all mb-4"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>

                {/* Delete Account Section */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-red-400/80 mb-3 uppercase tracking-wider">
                    Danger Zone
                  </h3>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-white mb-1">Delete Account</h4>
                        <p className="text-white/50 text-sm">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-all text-sm"
                      >
                        Delete My Account
                      </button>
                    ) : (
                      <div className="bg-red-500/20 rounded-lg p-4">
                        <p className="text-white text-sm mb-4">
                          Are you sure you want to delete your account? This will permanently remove all your data.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all text-sm disabled:opacity-50 flex items-center gap-2"
                          >
                            {deleting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Deleting...
                              </>
                            ) : (
                              'Yes, Delete My Account'
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleting}
                            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-all text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}