import React from 'react';

const statusFilters = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
];

const OrderFilter = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {statusFilters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentFilter === filter.value
              ? 'bg-primary-500 text-white'
              : 'bg-white text-masala-600 border border-masala-200 hover:bg-masala-50'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default OrderFilter;