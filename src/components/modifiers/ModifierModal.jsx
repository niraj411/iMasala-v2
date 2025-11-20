// src/components/modifiers/ModifierModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import { 
  getProductModifiers, 
  calculateModifierPrice, 
  modifierGroups 
} from '../../config/modifiers';

export default function ModifierModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}) {
  const [selections, setSelections] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState([]);
  
  const modifiers = getProductModifiers(product);
  
  // Initialize default selections
  useEffect(() => {
    if (isOpen && product) {
      const defaults = {};
      modifiers.forEach(group => {
        if (group.required && group.options.length > 0) {
          // Don't pre-select required fields - let user choose
          defaults[group.id] = null;
        } else if (!group.required && group.options.length > 0) {
          // For optional fields, select first option (usually "no change")
          defaults[group.id] = group.options[0].id;
        }
      });
      setSelections(defaults);
      setQuantity(1);
      setErrors([]);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const basePrice = parseFloat(product.price) || 0;
  const modifierPrice = calculateModifierPrice(selections);
  const itemTotal = (basePrice + modifierPrice) * quantity;

  const handleSelectionChange = (groupId, optionId, isMultiple = false) => {
    setSelections(prev => {
      if (isMultiple) {
        // Toggle for multiple selection
        const current = prev[groupId] || [];
        const updated = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [groupId]: updated };
      } else {
        // Replace for single selection
        return { ...prev, [groupId]: optionId };
      }
    });
    
    // Clear errors when user makes selection
    setErrors([]);
  };

  const validateSelections = () => {
    const validationErrors = [];
    
    modifiers.forEach(group => {
      if (group.required) {
        const selection = selections[group.id];
        if (!selection || (Array.isArray(selection) && selection.length === 0)) {
          validationErrors.push(`Please select ${group.name}`);
        }
      }
    });
    
    return validationErrors;
  };

  const handleAddToCart = () => {
    const validationErrors = validateSelections();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Build modifier details for cart
    const modifierDetails = {};
    modifiers.forEach(group => {
      const selection = selections[group.id];
      if (selection) {
        if (Array.isArray(selection)) {
          modifierDetails[group.id] = selection.map(optionId => {
            const option = group.options.find(o => o.id === optionId);
            return { id: optionId, name: option?.name, price: option?.price || 0 };
          });
        } else {
          const option = group.options.find(o => o.id === selection);
          modifierDetails[group.id] = { 
            id: selection, 
            name: option?.name, 
            price: option?.price || 0 
          };
        }
      }
    });

    onAddToCart({
      id: product.id,
      name: product.name,
      price: basePrice + modifierPrice, // Include modifier price in item price
      basePrice: basePrice,
      image: product.images && product.images[0]?.src,
      quantity: quantity,
      modifiers: modifierDetails,
      modifierTotal: modifierPrice
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-2xl z-50 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-4 border-b">
              {product.images && product.images[0]?.src && (
                <img
                  src={product.images[0].src}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-masala-900 pr-8">
                  {product.name}
                </h2>
                <p className="text-primary-600 font-semibold">
                  ${basePrice.toFixed(2)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-masala-100 rounded-lg"
              >
                <X className="w-5 h-5 text-masala-500" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {modifiers.map((group) => (
                <div key={group.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-masala-900">
                      {group.name}
                      {group.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>
                    {group.required && (
                      <span className="text-xs text-masala-500">Required</span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = group.type === 'multiple'
                        ? (selections[group.id] || []).includes(option.id)
                        : selections[group.id] === option.id;
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelectionChange(
                            group.id, 
                            option.id, 
                            group.type === 'multiple'
                          )}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-masala-200 hover:border-masala-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-masala-300'
                            }`}>
                              {isSelected && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-masala-900">
                              {option.name}
                              {option.icon && (
                                <span className="ml-2">{option.icon}</span>
                              )}
                            </span>
                          </div>
                          {option.price > 0 && (
                            <span className="text-sm text-masala-500">
                              +${option.price.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                      {errors.map((error, i) => (
                        <p key={i} className="text-sm text-red-700">{error}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-masala-900">Quantity</span>
                <div className="flex items-center gap-3 bg-masala-100 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Order - ${itemTotal.toFixed(2)}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}