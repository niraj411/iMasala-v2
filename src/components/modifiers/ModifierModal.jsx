// src/components/modifiers/ModifierModal.jsx - MOBILE OPTIMIZED
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
          defaults[group.id] = null;
        } else if (!group.required && group.options.length > 0) {
          defaults[group.id] = group.options[0].id;
        }
      });
      setSelections(defaults);
      setQuantity(1);
      setErrors([]);
    }
  }, [isOpen, product]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!product) return null;

  const basePrice = parseFloat(product.price) || 0;
  const modifierPrice = calculateModifierPrice(selections);
  const itemTotal = (basePrice + modifierPrice) * quantity;

  const handleSelectionChange = (groupId, optionId, isMultiple = false) => {
    setSelections(prev => {
      if (isMultiple) {
        const current = prev[groupId] || [];
        const updated = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [groupId]: updated };
      } else {
        return { ...prev, [groupId]: optionId };
      }
    });
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
      price: basePrice + modifierPrice,
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Container - MOBILE FIRST */}
          <div className="fixed inset-0 z-[101] flex items-end md:items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col pointer-events-auto"
            >
              {/* Drag Handle (Mobile) */}
              <div className="md:hidden flex justify-center pt-2 pb-1">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex items-start gap-3 p-4 md:p-6 border-b flex-shrink-0">
                {product.images && product.images[0]?.src && (
                  <img
                    src={product.images[0].src}
                    alt={product.name}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 pr-8">
                  <h2 className="text-base md:text-xl font-bold text-gray-900 line-clamp-2">
                    {product.name}
                  </h2>
                  <p className="text-orange-600 font-semibold mt-1">
                    ${basePrice.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 md:top-4 md:right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                {modifiers.map((group) => (
                  <div key={group.id}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                        {group.name}
                        {group.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h3>
                      {group.required && (
                        <span className="text-xs text-gray-500">Required</span>
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
                            className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-sm md:text-base ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected
                                  ? 'border-orange-500 bg-orange-500'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                              <span className="text-gray-900 text-left">
                                {option.name}
                                {option.icon && (
                                  <span className="ml-2">{option.icon}</span>
                                )}
                              </span>
                            </div>
                            {option.price > 0 && (
                              <span className="text-sm text-gray-600 font-medium ml-2 flex-shrink-0">
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
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4">
                    <div className="flex gap-2.5">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        {errors.map((error, i) => (
                          <p key={i} className="text-sm text-red-700">{error}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 md:p-6 space-y-3 md:space-y-4 flex-shrink-0 bg-white">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Quantity</span>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-colors active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg transition-colors active:scale-95"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 md:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Order - ${itemTotal.toFixed(2)}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}