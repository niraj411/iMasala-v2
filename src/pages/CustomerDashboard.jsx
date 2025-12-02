import React, { useState, useEffect } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { Package, ShieldCheck, Tag } from 'lucide-react';
import OrderCard from '../components/orders/OrderCard';
import TaxExemptionManager from '../components/customer/TaxExemptionManager';

export default function CustomerDashboard() {
  const { orders, loading } = useOrders();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

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
  }, [user?.email]);

  const customerOrders = orders;

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'tax', label: 'Tax Exemption', icon: ShieldCheck },
    { id: 'offers', label: 'Special Offers', icon: Tag }
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 mb-6">
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-white/40 font-medium">
            Manage your orders and account settings
          </p>
        </div>

        {/* Tabs */}
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-6">
          <div className="border-b border-white/10">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-6 text-center border-b-2 font-medium text-sm transition-all ${
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
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-lg font-semibold text-white/70 mb-4 uppercase tracking-wider text-sm">
                  My Orders
                </h2>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-10 h-10 mx-auto mb-3">
                      <div className="w-full h-full border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    </div>
                  </div>
                ) : customerOrders.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {customerOrders.map((order) => (
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
                    <p className="text-white/60 font-medium mb-1">No orders found</p>
                    <p className="text-white/30 text-sm">Your orders will appear here once you place them</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tax' && (
              <div>
                <TaxExemptionManager />
              </div>
            )}

            {activeTab === 'offers' && (
              <div>
                <h2 className="text-lg font-semibold text-white/70 mb-4 uppercase tracking-wider text-sm">
                  Special Offers & Coupons
                </h2>
                <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                  <p className="text-blue-300 font-medium">
                    Special offers and coupons will be displayed here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}