import React from 'react';
import { Package, CheckCircle, Clock, AlertCircle, Users, DollarSign } from 'lucide-react';

const StatsOverview = ({ orders, storeStats }) => {
  const stats = {
    total: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    processing: orders.filter(order => order.status === 'processing').length,
    completed: orders.filter(order => order.status === 'completed').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length,
  };

  const statCards = [
    { 
      icon: Package, 
      label: 'Total Orders', 
      value: stats.total, 
      color: 'blue',
      change: storeStats?.orders?.total || 0
    },
    { 
      icon: Clock, 
      label: 'Pending', 
      value: stats.pending, 
      color: 'yellow' 
    },
    { 
      icon: AlertCircle, 
      label: 'Processing', 
      value: stats.processing, 
      color: 'orange' 
    },
    { 
      icon: CheckCircle, 
      label: 'Completed', 
      value: stats.completed, 
      color: 'green' 
    },
    { 
      icon: Users, 
      label: 'Customers', 
      value: storeStats?.customers?.total || 0, 
      color: 'purple' 
    },
    { 
      icon: DollarSign, 
      label: 'Revenue', 
      value: `$${storeStats?.orders?.totals?.total_sales || '0'}`, 
      color: 'green',
      isRevenue: true
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg p-4 shadow-sm border border-masala-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-masala-600">{stat.label}</p>
              <p className="text-2xl font-bold text-masala-900">{stat.value}</p>
              {stat.change && !stat.isRevenue && (
                <p className="text-xs text-masala-500 mt-1">
                  {stat.change} total
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${colorClasses[stat.color]}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;