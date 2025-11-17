// src/components/customer/TaxExemptionManager.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Check, AlertCircle, FileText, Calendar } from 'lucide-react';
import { taxExemptionService } from '../../services/taxExemptionService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function TaxExemptionManager() {
  const { user } = useAuth();
  const [exemptionData, setExemptionData] = useState({
    licenseNumber: '',
    state: '',
    expiryDate: '',
    verified: false
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadExemptionData();
    }
  }, [user]);

  const loadExemptionData = async () => {
    try {
      const data = await taxExemptionService.getTaxExemption(user.id);
      if (data && Object.keys(data).length > 0) {
        setExemptionData(data);
      }
    } catch (error) {
      console.error('Error loading tax exemption:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await taxExemptionService.updateTaxExemption(user.id, exemptionData);
      toast.success('Tax exemption information updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update tax exemption information');
    } finally {
      setLoading(false);
    }
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  if (!isEditing && exemptionData.licenseNumber) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-masala-200 p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-masala-900">Tax Exempt Status</h3>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <Check className="w-4 h-4" />
                Active
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-masala-600">License Number</p>
            <p className="font-medium text-masala-900">{exemptionData.licenseNumber}</p>
          </div>
          <div>
            <p className="text-sm text-masala-600">State</p>
            <p className="font-medium text-masala-900">{exemptionData.state}</p>
          </div>
          <div>
            <p className="text-sm text-masala-600">Expiry Date</p>
            <p className="font-medium text-masala-900">{exemptionData.expiryDate}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-masala-200 p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-masala-900 mb-2">
          Tax Exemption Certificate
        </h3>
        <p className="text-sm text-masala-600">
          Upload your tax exemption certificate to apply tax-free status to your orders
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-masala-700 mb-1">
            Tax Exempt License Number
          </label>
          <input
            type="text"
            value={exemptionData.licenseNumber}
            onChange={(e) => setExemptionData({...exemptionData, licenseNumber: e.target.value})}
            className="w-full px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your license number"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-masala-700 mb-1">
              State
            </label>
            <select
              value={exemptionData.state}
              onChange={(e) => setExemptionData({...exemptionData, state: e.target.value})}
              className="w-full px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-masala-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={exemptionData.expiryDate}
              onChange={(e) => setExemptionData({...exemptionData, expiryDate: e.target.value})}
              className="w-full px-3 py-2 border border-masala-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Verification Required</p>
              <p>Your tax exemption will be verified by our team within 24-48 hours.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-masala-200 text-masala-700 rounded-lg hover:bg-masala-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Tax Exemption'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}