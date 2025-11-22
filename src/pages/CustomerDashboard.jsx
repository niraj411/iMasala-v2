// src/pages/CustomerDashboard.jsx (Updated)
import React, { useState } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import OrderCard from '../components/orders/OrderCard';
import TaxExemptionManager from '../components/customer/TaxExemptionManager';

export default function CustomerDashboard() {
  const { orders, loading } = useOrders();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  const customerOrders = orders
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
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No orders found</p>
                  <p className="text-gray-400 text-sm mt-1">Your orders will appear here once you place them</p>
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