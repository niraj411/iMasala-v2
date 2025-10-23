import React, { useState } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import OrderCard from '../components/orders/OrderCard';

export default function CustomerDashboard() {
  const { orders, loading } = useOrders();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  // Filter orders for current customer
  const customerOrders = orders.filter(order => order.customer_id === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Manage your orders and account settings
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'orders', label: 'My Orders' },
              { id: 'tax', label: 'Tax Exemption' },
              { id: 'offers', label: 'Special Offers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">My Orders</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
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
                <div className="text-center py-8 text-gray-500">
                  No orders found
                </div>
              )}
            </div>
          )}

          {activeTab === 'tax' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Tax Exemption</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  Tax exemption feature coming soon. You'll be able to upload your tax exemption certificate here.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Special Offers & Coupons</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  Special offers and coupons will be displayed here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}