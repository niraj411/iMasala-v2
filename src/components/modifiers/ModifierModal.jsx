// src/components/modifiers/ModifierModal.jsx - PREMIUM DARK GLASS DESIGN
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Check, AlertCircle, ShoppingBag } from 'lucide-react';
import {
  getProductModifiers,
  calculateModifierPrice,
  modifierGroups
} from '../../config/modifiers';
import { getEmojiForProduct } from '../../config/categoryImages';

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
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
          />
          
          {/* Modal Container - MOBILE FIRST */}
          <div className="fixed inset-0 z-[101] flex items-end md:items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-full md:max-w-lg pointer-events-auto"
            >
              <div className="bg-zinc-950/95 backdrop-blur-2xl rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col border border-white/10 md:mx-4">
                
                {/* Drag Handle (Mobile) */}
                <div className="md:hidden flex justify-center pt-3 pb-1">
                  <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
                </div>

                {/* Header */}
                <div className="flex items-start gap-4 p-5 md:p-6 border-b border-white/10 flex-shrink-0">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                    {product.images && product.images[0]?.src ? (
                      <img
                        src={product.images[0].src}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-2xl"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl items-center justify-center absolute inset-0"
                      style={{ display: product.images?.[0]?.src ? 'none' : 'flex' }}
                    >
                      <span className="text-4xl">{getEmojiForProduct(product)}</span>
                    </div>
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"></div>
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h2 className="text-lg md:text-xl font-bold text-white line-clamp-2 leading-tight">
                      {product.name}
                    </h2>
                    <p className="text-orange-400 font-bold text-xl mt-2">
                      ${basePrice.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-5 md:right-5 w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
                  {modifiers.map((group) => (
                    <div key={group.id}>
                      {/* Group Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white text-base">
                          {group.name}
                          {group.required && (
                            <span className="text-orange-400 ml-1">*</span>
                          )}
                        </h3>
                        {group.required && (
                          <span className="text-xs text-white/40 bg-white/5 px-2.5 py-1 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      
                      {/* Options */}
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
                              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                                isSelected
                                  ? 'bg-orange-500/10 border-orange-500/50 shadow-lg shadow-orange-500/10'
                                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Custom Radio/Checkbox */}
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  isSelected
                                    ? 'border-orange-500 bg-orange-500 shadow-lg shadow-orange-500/30'
                                    : 'border-white/30 bg-transparent'
                                }`}>
                                  {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                  )}
                                </div>
                                <span className={`text-left transition-colors ${
                                  isSelected ? 'text-white font-medium' : 'text-white/80'
                                }`}>
                                  {option.name}
                                  {option.icon && (
                                    <span className="ml-2">{option.icon}</span>
                                  )}
                                </span>
                              </div>
                              {option.price > 0 && (
                                <span className={`text-sm font-medium ml-2 flex-shrink-0 ${
                                  isSelected ? 'text-orange-400' : 'text-white/50'
                                }`}>
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
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4"
                    >
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          {errors.map((error, i) => (
                            <p key={i} className="text-sm text-red-300">{error}</p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 p-5 md:p-6 space-y-4 flex-shrink-0 bg-zinc-950/95 backdrop-blur-2xl">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">Quantity</span>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors active:scale-95 text-white/70 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-white text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors active:scale-95 text-white/70 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 md:py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add to Order • ${itemTotal.toFixed(2)}
                  </button>
                </div>
                
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}