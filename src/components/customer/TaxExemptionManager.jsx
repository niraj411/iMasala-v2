// src/components/customer/TaxExemptionManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, AlertCircle, CheckCircle2, 
  Edit2, Trash2, X, Building2, Calendar, Hash
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { taxExemptionService } from '../../services/taxExemptionService';
import toast from 'react-hot-toast';

// US States for dropdown
const US_STATES = [
  { code: 'CO', name: 'Colorado' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'CA', name: 'California' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NV', name: 'Nevada' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'WY', name: 'Wyoming' },
  // Add more as needed
];

export default function TaxExemptionManager() {
  const { user } = useAuth();
  const [exemptionData, setExemptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    licenseNumber: '',
    state: 'CO',
    expiryDate: '',
    organizationName: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadExemptionData();
  }, [user]);

  const loadExemptionData = async () => {
    if (!user?.id && !user?.email) {
      setLoading(false);
      return;
    }

    const userId = user.id || user.email;
    const data = await taxExemptionService.getTaxExemption(userId);
    setExemptionData(data);

    if (data) {
      setFormData({
        licenseNumber: data.licenseNumber || '',
        state: data.state || 'CO',
        expiryDate: data.expiryDate || '',
        organizationName: data.organizationName || ''
      });
    }

    setLoading(false);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.licenseNumber?.trim()) {
      errors.licenseNumber = 'Tax exempt license number is required';
    } else if (!taxExemptionService.validateLicenseFormat(formData.licenseNumber)) {
      errors.licenseNumber = 'Invalid license number format';
    }
    
    if (!formData.state) {
      errors.state = 'State is required';
    }
    
    if (formData.expiryDate) {
      const expiry = new Date(formData.expiryDate);
      const today = new Date();
      if (expiry < today) {
        errors.expiryDate = 'Expiry date cannot be in the past';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      const userId = user.id || user.email;
      const savedData = await taxExemptionService.saveTaxExemption(userId, formData);
      setExemptionData(savedData);
      setShowForm(false);
      toast.success('Tax exemption saved successfully!');
    } catch (error) {
      console.error('Error saving tax exemption:', error);
      toast.error('Failed to save tax exemption');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your tax exemption?')) return;

    const userId = user.id || user.email;
    await taxExemptionService.removeTaxExemption(userId);
    setExemptionData(null);
    setFormData({
      licenseNumber: '',
      state: 'CO',
      expiryDate: '',
      organizationName: ''
    });
    toast.success('Tax exemption removed');
  };

  const handleEdit = () => {
    setShowForm(true);
  };

  // Calculate min date (today) for expiry
  const minExpiryDate = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 mx-auto mb-3">
          <div className="w-full h-full border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">
        Tax Exemption Status
      </h2>

      {/* Current Status Card */}
      {exemptionData && !showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-5 mb-4 ${
            exemptionData.verified && !exemptionData.expired
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-amber-500/10 border border-amber-500/20'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                exemptionData.verified && !exemptionData.expired
                  ? 'bg-green-500/20'
                  : 'bg-amber-500/20'
              }`}>
                {exemptionData.verified && !exemptionData.expired ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">Tax Exempt</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    exemptionData.verified && !exemptionData.expired
                      ? 'bg-green-500/30 text-green-300'
                      : 'bg-amber-500/30 text-amber-300'
                  }`}>
                    {exemptionData.expired ? 'Expired' : exemptionData.verified ? 'Active' : 'Pending'}
                  </span>
                </div>
                
                <div className="space-y-1 mt-3">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Hash className="w-4 h-4" />
                    <span>License: <span className="text-white font-medium">{exemptionData.licenseNumber}</span></span>
                  </div>
                  {exemptionData.organizationName && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Building2 className="w-4 h-4" />
                      <span>{exemptionData.organizationName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <ShieldCheck className="w-4 h-4" />
                    <span>State: {exemptionData.state}</span>
                  </div>
                  {exemptionData.expiryDate && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {new Date(exemptionData.expiryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-white/40" />
              </button>
              <button
                onClick={handleRemove}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4 text-red-400/60" />
              </button>
            </div>
          </div>
          
          {exemptionData.verified && !exemptionData.expired && (
            <p className="text-green-400/80 text-sm mt-4 pt-4 border-t border-green-500/20">
              ✓ Tax will be automatically removed from your orders at checkout
            </p>
          )}
          
          {exemptionData.expired && (
            <p className="text-amber-400/80 text-sm mt-4 pt-4 border-t border-amber-500/20">
              ⚠ Your exemption has expired. Please update with new expiry date.
            </p>
          )}
        </motion.div>
      ) : !showForm && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/60 font-medium mb-1">No tax exemption on file</p>
          <p className="text-white/30 text-sm mb-4">
            If you're a non-profit or tax-exempt organization, add your details below
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all"
          >
            Add Tax Exemption
          </button>
        </div>
      )}

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">Tax Exemption Details</h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Organization Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  placeholder="e.g., Boulder Valley School District"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />
              </div>
              
              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  Tax Exempt License Number *
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g., 98-12345-0001"
                  required
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none ${
                    formErrors.licenseNumber ? 'border-red-500/50' : 'border-white/10 focus:border-white/20'
                  }`}
                />
                {formErrors.licenseNumber && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.licenseNumber}</p>
                )}
              </div>
              
              {/* State & Expiry Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Issuing State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 appearance-none"
                  >
                    {US_STATES.map(state => (
                      <option key={state.code} value={state.code} className="bg-zinc-900">
                        {state.name} ({state.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    min={minExpiryDate}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none ${
                      formErrors.expiryDate ? 'border-red-500/50' : 'border-white/10 focus:border-white/20'
                    }`}
                  />
                  {formErrors.expiryDate && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.expiryDate}</p>
                  )}
                </div>
              </div>
              
              {/* Info Note */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-300 text-sm">
                  💡 Your tax exemption will be applied automatically at checkout once saved.
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-white hover:bg-white/90 text-black rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Save Exemption
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormErrors({});
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
    </div>
  );
}