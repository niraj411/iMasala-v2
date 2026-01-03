import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Calculator, Calendar, Download, DollarSign,
  Receipt, TrendingUp, Percent, ChevronDown, Loader2, CreditCard,
  FileText, ShieldCheck, Tag, Building2
} from 'lucide-react';
import { woocommerceService } from '../../services/woocommerceService';

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Helper to format date for display
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper to format date for input
const formatDateForInput = (date) => {
  return date.toISOString().split('T')[0];
};

// Get date ranges for presets
const getDateRange = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case 'thisWeek': {
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      return { start: startOfWeek, end: now };
    }
    case 'thisMonth':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      };
    case 'thisQuarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      return {
        start: new Date(now.getFullYear(), quarter * 3, 1),
        end: now
      };
    }
    case 'thisYear':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      };
    case 'lastMonth': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: lastMonth, end: endOfLastMonth };
    }
    default:
      return { start: today, end: now };
  }
};

export default function AccountingReport() {
  const [datePreset, setDatePreset] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Orders state - fetched specifically for accounting
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, page: 0 });
  const [error, setError] = useState(null);

  // Get the active date range
  const dateRange = useMemo(() => {
    if (showCustom && customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate + 'T23:59:59')
      };
    }
    return getDateRange(datePreset);
  }, [datePreset, showCustom, customStartDate, customEndDate]);

  // Fetch orders when date range changes
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress({ loaded: 0, page: 0 });

    try {
      const fetchedOrders = await woocommerceService.getOrdersForDateRange(
        dateRange.start,
        dateRange.end,
        (progress) => {
          setLoadingProgress(progress);
        }
      );
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fetch orders when date range changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders to exact date range (API uses buffer for safety)
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.date_created);
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
  }, [orders, dateRange]);

  // Helper to get tip from an order (NOT Stripe fees)
  const getOrderTip = (order) => {
    const tipFromFees = order.fee_lines?.find(f =>
      f.name?.toLowerCase().includes('tip') &&
      !f.name?.toLowerCase().includes('stripe')
    )?.total;
    const tipFromMeta = order.meta_data?.find(m =>
      m.key === 'tip_amount' || m.key === '_tip_amount'
    )?.value;
    return parseFloat(tipFromFees || tipFromMeta || 0);
  };

  // Helper to get Stripe fee from an order
  const getStripeFee = (order) => {
    const stripeFee = order.meta_data?.find(m =>
      m.key === '_stripe_fee'
    )?.value;
    return parseFloat(stripeFee || 0);
  };

  // Helper to check if order is tax exempt
  const isTaxExempt = (order) => {
    return order.meta_data?.find(m => m.key === 'tax_exempt')?.value === 'yes';
  };

  // Helper to get discount amount
  const getDiscount = (order) => {
    return parseFloat(order.discount_total) || 0;
  };

  // Calculate comprehensive financial totals
  const totals = useMemo(() => {
    const completedOrders = filteredOrders.filter(o =>
      o.status === 'completed' || o.status === 'processing'
    );

    let grossSales = 0;        // Subtotal before tax (sum of line items)
    let discounts = 0;         // Coupons/discounts applied
    let netSales = 0;          // Gross - Discounts
    let taxableSales = 0;      // Sales that were taxed
    let taxExemptSales = 0;    // Sales that were not taxed
    let salesTaxCollected = 0; // Tax to remit to state
    let tips = 0;              // Tips (separate for employees)
    let stripeFees = 0;        // Payment processing fees
    let totalCollected = 0;    // What customers paid
    let refunds = 0;           // Refunded orders

    completedOrders.forEach(order => {
      const tip = getOrderTip(order);
      const stripeFee = getStripeFee(order);
      const discount = getDiscount(order);
      const orderTotal = parseFloat(order.total) || 0;
      const orderTax = parseFloat(order.total_tax) || 0;
      const taxExempt = isTaxExempt(order);

      // Subtotal = Total - Tax - Tip (what the food/items cost before tax)
      const subtotal = orderTotal - orderTax - tip;

      grossSales += subtotal + discount; // Add back discounts for gross
      discounts += discount;
      netSales += subtotal;
      salesTaxCollected += orderTax;
      tips += tip;
      stripeFees += stripeFee;
      totalCollected += orderTotal;

      // Track taxable vs tax-exempt sales
      if (taxExempt || orderTax === 0) {
        taxExemptSales += subtotal;
      } else {
        taxableSales += subtotal;
      }
    });

    // Check for refunded orders
    const refundedOrders = filteredOrders.filter(o => o.status === 'refunded');
    refundedOrders.forEach(order => {
      refunds += parseFloat(order.total) || 0;
    });

    // Net deposit = what actually hits your bank account
    const netDeposit = totalCollected - stripeFees - refunds;

    return {
      grossSales,
      discounts,
      netSales,
      taxableSales,
      taxExemptSales,
      salesTaxCollected,
      tips,
      stripeFees,
      totalCollected,
      refunds,
      netDeposit,
      orderCount: completedOrders.length,
      taxExemptOrderCount: completedOrders.filter(o => isTaxExempt(o)).length
    };
  }, [filteredOrders]);

  // Export to CSV - formatted for accountants
  const exportCSV = () => {
    const completedOrders = filteredOrders.filter(o =>
      o.status === 'completed' || o.status === 'processing'
    );

    // Individual order details
    const headers = [
      'Order ID', 'Date', 'Customer', 'Subtotal', 'Discount', 'Net Sale',
      'Tax Exempt', 'Sales Tax', 'Tip', 'Stripe Fee', 'Total Collected', 'Status'
    ];

    const rows = completedOrders.map(order => {
      const tip = getOrderTip(order);
      const stripeFee = getStripeFee(order);
      const discount = getDiscount(order);
      const total = parseFloat(order.total) || 0;
      const tax = parseFloat(order.total_tax) || 0;
      const subtotal = total - tax - tip;
      const taxExempt = isTaxExempt(order);

      return [
        order.id,
        formatDate(order.date_created),
        `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim(),
        (subtotal + discount).toFixed(2),
        discount.toFixed(2),
        subtotal.toFixed(2),
        taxExempt ? 'Yes' : 'No',
        tax.toFixed(2),
        tip.toFixed(2),
        stripeFee.toFixed(2),
        total.toFixed(2),
        order.status
      ];
    });

    // Build CSV content
    let csvContent = '';

    // === SUMMARY SECTION FOR ACCOUNTANT ===
    csvContent += 'ACCOUNTING SUMMARY\n';
    csvContent += `Report Period,"${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}"\n`;
    csvContent += `Generated,"${new Date().toLocaleString()}"\n`;
    csvContent += '\n';

    // Sales Summary
    csvContent += 'SALES SUMMARY\n';
    csvContent += `Total Orders,${totals.orderCount}\n`;
    csvContent += `Gross Sales (before discounts),"${formatCurrency(totals.grossSales)}"\n`;
    csvContent += `Discounts Given,"(${formatCurrency(totals.discounts)})"\n`;
    csvContent += `Net Sales,"${formatCurrency(totals.netSales)}"\n`;
    csvContent += '\n';

    // Sales Tax Report - THIS IS WHAT YOU REMIT TO THE STATE
    csvContent += 'SALES TAX REPORT (For State Remittance)\n';
    csvContent += `Taxable Sales,"${formatCurrency(totals.taxableSales)}"\n`;
    csvContent += `Tax-Exempt Sales,"${formatCurrency(totals.taxExemptSales)}"\n`;
    csvContent += `Tax-Exempt Orders,${totals.taxExemptOrderCount}\n`;
    csvContent += `SALES TAX COLLECTED,"${formatCurrency(totals.salesTaxCollected)}"\n`;
    csvContent += '\n';

    // Tips - Separate for payroll
    csvContent += 'TIPS (For Payroll)\n';
    csvContent += `Tips Collected,"${formatCurrency(totals.tips)}"\n`;
    csvContent += '\n';

    // Payment Processing
    csvContent += 'PAYMENT PROCESSING\n';
    csvContent += `Stripe Fees (Expense),"${formatCurrency(totals.stripeFees)}"\n`;
    csvContent += `Refunds,"${formatCurrency(totals.refunds)}"\n`;
    csvContent += '\n';

    // Cash Flow Summary
    csvContent += 'CASH FLOW SUMMARY\n';
    csvContent += `Total Collected from Customers,"${formatCurrency(totals.totalCollected)}"\n`;
    csvContent += `Less: Stripe Fees,"(${formatCurrency(totals.stripeFees)})"\n`;
    csvContent += `Less: Refunds,"(${formatCurrency(totals.refunds)})"\n`;
    csvContent += `NET BANK DEPOSIT,"${formatCurrency(totals.netDeposit)}"\n`;
    csvContent += '\n';
    csvContent += '\n';

    // Individual Orders
    csvContent += 'ORDER DETAILS\n';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `accounting-report-${formatDateForInput(dateRange.start)}-to-${formatDateForInput(dateRange.end)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presetLabels = {
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisQuarter: 'This Quarter',
    thisYear: 'This Year',
    lastMonth: 'Last Month'
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Controls */}
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-400" />
              Accounting Report
            </h2>
            <p className="text-sm text-white/40 mt-1">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading orders... ({loadingProgress.loaded} found)
                </span>
              ) : (
                `${totals.orderCount} orders from ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Preset Selector */}
            <div className="relative">
              <select
                value={showCustom ? 'custom' : datePreset}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setShowCustom(true);
                    if (!customStartDate) {
                      const range = getDateRange('thisMonth');
                      setCustomStartDate(formatDateForInput(range.start));
                      setCustomEndDate(formatDateForInput(range.end));
                    }
                  } else {
                    setShowCustom(false);
                    setDatePreset(e.target.value);
                  }
                }}
                disabled={loading}
                className="appearance-none pl-4 pr-10 py-2.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white font-medium text-sm focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {Object.entries(presetLabels).map(([value, label]) => (
                  <option key={value} value={value} className="bg-black">{label}</option>
                ))}
                <option value="custom" className="bg-black">Custom Range</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>

            {/* Custom Date Inputs */}
            {showCustom && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  disabled={loading}
                  className="px-3 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all disabled:opacity-50"
                />
                <span className="text-white/40">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  disabled={loading}
                  className="px-3 py-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all disabled:opacity-50"
                />
              </div>
            )}

            {/* Export Button */}
            <button
              onClick={exportCSV}
              disabled={loading || filteredOrders.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export for Accountant
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 rounded-2xl border border-red-500/20 p-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-2 text-sm text-red-300 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 text-center">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin mx-auto mb-3" />
          <p className="text-white/60 font-medium">Fetching orders...</p>
          <p className="text-white/40 text-sm mt-1">
            {loadingProgress.loaded} orders loaded (page {loadingProgress.page})
          </p>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Sales Summary */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Sales Summary
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/50 mb-1">Gross Sales</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totals.grossSales)}</p>
                <p className="text-xs text-white/30 mt-1">Before discounts</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/50 mb-1">Discounts</p>
                <p className="text-2xl font-bold text-red-400">-{formatCurrency(totals.discounts)}</p>
                <p className="text-xs text-white/30 mt-1">Coupons applied</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/50 mb-1">Net Sales</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totals.netSales)}</p>
                <p className="text-xs text-white/30 mt-1">After discounts</p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300 mb-1">Total Collected</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(totals.totalCollected)}</p>
                <p className="text-xs text-blue-300/50 mt-1">From customers</p>
              </div>
            </div>
          </div>

          {/* Sales Tax Report - THE IMPORTANT ONE FOR STATE */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl border border-amber-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Sales Tax Report
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg ml-2">For State Remittance</span>
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/50 mb-1">Taxable Sales</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totals.taxableSales)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/50 mb-1">Tax-Exempt Sales</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totals.taxExemptSales)}</p>
                <p className="text-xs text-white/30 mt-1">{totals.taxExemptOrderCount} orders</p>
              </div>
              <div className="p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl col-span-2 lg:col-span-2">
                <p className="text-sm text-amber-300 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Sales Tax Collected
                </p>
                <p className="text-3xl font-bold text-amber-400">{formatCurrency(totals.salesTaxCollected)}</p>
                <p className="text-xs text-amber-300/60 mt-1">Amount to remit to Colorado</p>
              </div>
            </div>
          </div>

          {/* Tips & Processing Fees */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tips */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-green-400" />
                Tips Collected
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-lg ml-2">For Payroll</span>
              </h3>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-3xl font-bold text-green-400">{formatCurrency(totals.tips)}</p>
                <p className="text-sm text-green-300/60 mt-1">Separate from business revenue</p>
              </div>
            </div>

            {/* Stripe Fees & Refunds */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Payment Processing
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <span className="text-purple-300">Stripe Fees (Expense)</span>
                  <span className="text-xl font-bold text-purple-400">{formatCurrency(totals.stripeFees)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <span className="text-red-300">Refunds</span>
                  <span className="text-xl font-bold text-red-400">{formatCurrency(totals.refunds)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Bank Deposit */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl border border-green-500/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Cash Flow Summary
            </h3>
            <div className="space-y-2 max-w-md">
              <div className="flex items-center justify-between py-2">
                <span className="text-white/60">Total Collected</span>
                <span className="text-white font-medium">{formatCurrency(totals.totalCollected)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-white/60">Less: Stripe Fees</span>
                <span className="text-red-400">-{formatCurrency(totals.stripeFees)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-white/60">Less: Refunds</span>
                <span className="text-red-400">-{formatCurrency(totals.refunds)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-white/10">
                <span className="text-green-400 font-semibold">Net Bank Deposit</span>
                <span className="text-2xl font-bold text-green-400">{formatCurrency(totals.netDeposit)}</span>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-white/60" />
                Order Details ({totals.orderCount})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Subtotal</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Discount</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Tax</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Tip</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Stripe Fee</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders
                    .filter(o => o.status === 'completed' || o.status === 'processing')
                    .slice(0, 100)
                    .map(order => {
                      const tip = getOrderTip(order);
                      const stripeFee = getStripeFee(order);
                      const discount = getDiscount(order);
                      const total = parseFloat(order.total) || 0;
                      const tax = parseFloat(order.total_tax) || 0;
                      const subtotal = total - tax - tip;
                      const taxExempt = isTaxExempt(order);

                      return (
                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-white">#{order.id}</span>
                            {taxExempt && (
                              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                                Tax Exempt
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white/60">{formatDate(order.date_created)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white/80">
                              {order.billing?.first_name} {order.billing?.last_name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-white">{formatCurrency(subtotal)}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm ${discount > 0 ? 'text-red-400' : 'text-white/40'}`}>
                              {discount > 0 ? `-${formatCurrency(discount)}` : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm ${taxExempt ? 'text-green-400' : 'text-white/60'}`}>
                              {taxExempt ? 'Exempt' : formatCurrency(tax)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm ${tip > 0 ? 'text-green-400 font-medium' : 'text-white/40'}`}>
                              {tip > 0 ? formatCurrency(tip) : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm ${stripeFee > 0 ? 'text-purple-400' : 'text-white/40'}`}>
                              {stripeFee > 0 ? formatCurrency(stripeFee) : '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-white">{formatCurrency(total)}</span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {filteredOrders.filter(o => o.status === 'completed' || o.status === 'processing').length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/40 font-medium">No orders found for this period</p>
                </div>
              )}

              {filteredOrders.filter(o => o.status === 'completed' || o.status === 'processing').length > 100 && (
                <div className="p-4 text-center border-t border-white/10">
                  <p className="text-sm text-white/40">
                    Showing first 100 orders. Export CSV for complete data ({totals.orderCount} total orders).
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
